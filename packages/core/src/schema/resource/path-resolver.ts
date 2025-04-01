import {
  type AnyAttribute,
  ArrayAttribute,
  ObjectAttribute,
  OneOfAttribute,
  type OneOfCase
} from '../../attributes';
import { EphemeralCache } from '../../cache';
import {
  ARRAY_MARKER,
  DEFAULT_PATH_SEPARATOR,
  OPTIONAL_MARKER
} from '../../constants';
import { minutesToMs } from '../../utils';
import type { AnyResource } from './resource';

/**
 * Error messages used throughout ResourcePathResolver.
 * Used for consistent error handling and debug output.
 */
export const ERROR_MESSAGE = {
  EMPTY_PATH: 'Path cannot be empty',
  UNDEFINED_SEGMENT: 'Path segment is undefined',
  ATTRIBUTE_NOT_FOUND: 'Attribute "{0}" not found',
  NOT_ARRAY: 'Attribute "{0}" is not an array',
  ARRAY_ITEMS_NOT_OBJECTS:
    'Array items are not objects, cannot navigate deeper',
  CANNOT_NAVIGATE_PRIMITIVE:
    'Cannot navigate deeper into primitive attribute "{0}"',
  NOT_FOUND_IN_ONEOF: 'Attribute not found in any case of OneOf'
};

/**
 * Default values for ResourcePathResolver configuration
 */
const DEFAULTS = {
  CACHE_TTL_MINUTES: 1
};

/**
 * Result of path validation
 */
export interface PathValidationResult<T extends AnyAttribute = AnyAttribute> {
  /** Whether the path is valid */
  valid: boolean;
  /** The parent attribute of the last path segment */
  parentAttribute?: T;
  /** The last successfully validated path segment */
  lastValidSegment?: string;
  /** The name of the last validated attribute */
  attributeName?: string;
  /** The full path to the last validated attribute */
  fullPath?: string;
  /** Error message if the path is invalid */
  error?: string;
  /** The attribute found at the end of the path (if exists) */
  attribute?: AnyAttribute;
}

/**
 * Configuration options for ResourcePathResolver
 */
export interface ResourcePathResolverOptions {
  /** Separator used in paths (defaults to '.') */
  pathSeparator?: string;
  /** Whether to enable result caching (defaults to true) */
  enableCache?: boolean;
  /** Time-to-live for cached results in milliseconds (defaults to 60000 - 1 minute) */
  cacheTtlMs?: number;
}

/**
 * Validation context for tracking state during path validation
 */
interface ValidationContext {
  currentAttributes: Record<string, AnyAttribute>;
  parentAttribute?: AnyAttribute;
  currentPath: string;
  lastValidSegment: string;
  attributeName: string;
  foundAttribute?: AnyAttribute;
  pathSeparator: string;
}

/**
 * ResourcePathResolver is responsible for validating and resolving
 * paths to attributes inside complex Resource definitions.
 *
 * Supports deep navigation through:
 * - nested ObjectAttributes
 * - ArrayAttributes
 * - OneOfAttribute branches (discriminator logic)
 * - optional markers (e.g., `field?`)
 * - array markers (e.g., `items[]`)
 */
export class ResourcePathResolver {
  private static instance: ResourcePathResolver | null = null;

  private pathSeparator: string;
  private enableCache: boolean;
  private cache: EphemeralCache;

  private constructor(options: Required<ResourcePathResolverOptions>) {
    this.pathSeparator = options.pathSeparator;
    this.enableCache = options.enableCache;
    this.cache = new EphemeralCache(options.cacheTtlMs);
  }

  /**
   * Retrieves a singleton instance of the resolver.
   *
   * @param options - Configuration override (optional)
   * @returns Singleton instance of ResourcePathResolver
   */
  public static getInstance({
    cacheTtlMs = minutesToMs(DEFAULTS.CACHE_TTL_MINUTES),
    enableCache = true,
    pathSeparator = DEFAULT_PATH_SEPARATOR
  }: ResourcePathResolverOptions = {}): ResourcePathResolver {
    if (!ResourcePathResolver.instance) {
      ResourcePathResolver.instance = new ResourcePathResolver({
        cacheTtlMs,
        enableCache,
        pathSeparator
      });
    }
    return ResourcePathResolver.instance;
  }

  /**
   * Validates whether a given path exists in the provided resource.
   * Uses internal recursive logic to resolve deeply nested attributes.
   * Automatically caches the result (if enabled).
   *
   * @param resource - The resource schema to search
   * @param path - Separated path string (e.g., 'user.address.city')
   * @returns A validation result including attribute and context info
   */
  public validatePath(
    resource: AnyResource,
    path: string
  ): PathValidationResult {
    if (this.enableCache) {
      const cacheKey = this.getCacheKey(resource, path);
      const cachedResult = this.cache.get<PathValidationResult>(cacheKey);

      if (cachedResult) {
        return cachedResult;
      }
    }

    const result = this.doValidatePath(resource, path);

    if (this.enableCache) {
      const cacheKey = this.getCacheKey(resource, path);
      this.cache.set(cacheKey, result);
    }

    return result;
  }

  /**
   * Returns the attribute located at the given path, or undefined if not found.
   *
   * @param resource - Resource to search
   * @param path - Separated attribute path
   * @returns The attribute instance or undefined if path is invalid
   */
  public getAttributeAtPath(
    resource: AnyResource,
    path: string
  ): AnyAttribute | undefined {
    const validation = this.validatePath(resource, path);
    return validation.valid ? validation.attribute : undefined;
  }

  /**
   * Returns the parent attribute (e.g. Object or Array) of the last path segment.
   *
   * @param resource - Resource to search
   * @param path - Path string
   * @returns The parent attribute, or undefined if path is invalid
   */
  public getParentAttributeAtPath(
    resource: AnyResource,
    path: string
  ): AnyAttribute | undefined {
    const validation = this.validatePath(resource, path);
    return validation.valid ? validation.parentAttribute : undefined;
  }

  /**
   * Checks whether a given path exists in the resource.
   * This is a lightweight wrapper around `validatePath(...)`.
   *
   * @param resource - Resource to search
   * @param path - Path string
   * @returns `true` if path is valid, otherwise `false`
   */
  public pathExists(resource: AnyResource, path: string): boolean {
    const validation = this.validatePath(resource, path);
    return validation.valid;
  }

  /**
   * Clears all cached validation results.
   */
  public clearCache(): void {
    this.cache.clear();
  }

  /**
   * Invalidates specific cached paths for a given resource.
   * If you mutate a resource dynamically, you may call this.
   *
   * @param resource - Resource instance
   * @param paths - One or more path strings to remove from cache
   * @returns `true` if all keys were removed
   */
  public invalidateCachePaths(
    resource: AnyResource,
    ...paths: string[]
  ): boolean {
    const keys = paths.map((path) => this.getCacheKey(resource, path));
    return this.cache.delete(...keys);
  }

  /**
   * Performs the actual recursive validation of a path inside a resource.
   * Traverses each path segment step-by-step and updates validation context.
   *
   * @param resource - Resource object containing attributes
   * @param path - Dot-separated path string
   * @returns Result of validation
   */
  private doValidatePath(
    resource: AnyResource,
    path: string
  ): PathValidationResult {
    if (!path) {
      return {
        valid: false,
        error: ERROR_MESSAGE.EMPTY_PATH
      };
    }

    const segments = path.split(this.pathSeparator);

    const context: ValidationContext = {
      currentAttributes: resource.attributes,
      currentPath: '',
      lastValidSegment: '',
      attributeName: '',
      pathSeparator: this.pathSeparator
    };

    for (let i = 0; i < segments.length; i++) {
      const segment = segments[i] || '';
      if (!segment) {
        return {
          valid: false,
          error: ERROR_MESSAGE.UNDEFINED_SEGMENT
        };
      }

      const isLast = i === segments.length - 1;

      const result = this.processPathSegment(
        segment,
        isLast,
        context,
        segments.slice(i + 1)
      );

      if (result) {
        return result;
      }
    }

    const lastSegment = segments.at(-1);
    return {
      valid: true,
      parentAttribute: context.parentAttribute,
      lastValidSegment: lastSegment,
      attributeName: lastSegment ? this.removeOptionalMarker(lastSegment) : '',
      fullPath: context.currentPath,
      attribute: lastSegment
        ? context.currentAttributes[this.removeOptionalMarker(lastSegment)]
        : undefined
    };
  }

  /**
   * Computes a cache key based on resource name and full path.
   *
   * @param resource - Resource object
   * @param path - Path string
   * @returns String cache key
   */
  private getCacheKey(resource: AnyResource, path: string): string {
    return `${resource.name}:${path}`;
  }

  /**
   * Processes a single segment of the path and updates context.
   * Handles arrays, objects, oneOf structures and primitives.
   *
   * @param segment - Current path segment
   * @param isLast - Whether this is the final segment
   * @param context - Current validation state
   * @param remainingSegments - Remaining segments to process
   * @returns A result (valid/invalid) if terminal state is reached, otherwise undefined
   */
  private processPathSegment(
    segment: string,
    isLast: boolean,
    context: ValidationContext,
    remainingSegments: string[]
  ): PathValidationResult | undefined {
    if (context.currentPath) {
      context.currentPath += context.pathSeparator + segment;
    } else {
      context.currentPath = segment;
    }

    if (this.isArraySegment(segment)) {
      return this.processArraySegment(segment, isLast, context);
    }

    const cleanSegment = this.removeOptionalMarker(segment);

    if (!(cleanSegment in context.currentAttributes)) {
      return {
        valid: false,
        parentAttribute: context.parentAttribute,
        lastValidSegment: context.lastValidSegment,
        attributeName: context.attributeName,
        fullPath: context.lastValidSegment
          ? context.currentPath.slice(0, -(segment.length + 1))
          : '',
        error: ERROR_MESSAGE.ATTRIBUTE_NOT_FOUND.replace('{0}', cleanSegment)
      };
    }

    const attr = context.currentAttributes[cleanSegment];

    if (isLast) {
      return {
        valid: true,
        parentAttribute: context.parentAttribute,
        lastValidSegment: segment,
        attributeName: cleanSegment,
        fullPath: context.currentPath,
        attribute: attr
      };
    }

    if (attr instanceof ObjectAttribute) {
      context.parentAttribute = attr;
      context.currentAttributes = attr._def.shape;
      context.lastValidSegment = segment;
      context.attributeName = cleanSegment;
      return undefined;
    }

    if (attr instanceof OneOfAttribute) {
      return this.processOneOfSegment(
        attr,
        segment,
        cleanSegment,
        context,
        remainingSegments
      );
    }

    return {
      valid: false,
      parentAttribute: attr,
      lastValidSegment: segment,
      attributeName: cleanSegment,
      fullPath: context.currentPath,
      error: ERROR_MESSAGE.CANNOT_NAVIGATE_PRIMITIVE.replace(
        '{0}',
        cleanSegment
      )
    };
  }

  /**
   * Handles path segments that reference arrays (e.g., "users[]").
   * Validates the array and optionally continues into its items.
   *
   * @param segment - Array segment (e.g. "items[]")
   * @param isLast - Whether this is the last path segment
   * @param context - Current validation state
   * @returns PathValidationResult or undefined to continue recursion
   */
  private processArraySegment(
    segment: string,
    isLast: boolean,
    context: ValidationContext
  ): PathValidationResult | undefined {
    const arrayName = this.removeArrayMarker(segment);

    if (!(arrayName in context.currentAttributes)) {
      return {
        valid: false,
        parentAttribute: context.parentAttribute,
        lastValidSegment: context.lastValidSegment,
        attributeName: context.attributeName,
        fullPath: context.lastValidSegment
          ? context.currentPath.slice(0, -(segment.length + 1))
          : '',
        error: ERROR_MESSAGE.ATTRIBUTE_NOT_FOUND.replace('{0}', arrayName)
      };
    }

    const arrayAttr = context.currentAttributes[arrayName];

    if (!(arrayAttr instanceof ArrayAttribute)) {
      return {
        valid: false,
        parentAttribute: context.parentAttribute,
        lastValidSegment: context.lastValidSegment,
        attributeName: context.attributeName,
        fullPath: context.lastValidSegment
          ? context.currentPath.slice(0, -(segment.length + 1))
          : '',
        error: ERROR_MESSAGE.NOT_ARRAY.replace('{0}', arrayName)
      };
    }

    if (isLast) {
      return {
        valid: true,
        parentAttribute: context.parentAttribute,
        lastValidSegment: segment,
        attributeName: arrayName,
        fullPath: context.currentPath,
        attribute: arrayAttr
      };
    }

    const itemAttr = arrayAttr._def.itemType;
    if (!(itemAttr instanceof ObjectAttribute)) {
      return {
        valid: false,
        parentAttribute: arrayAttr,
        lastValidSegment: segment,
        attributeName: arrayName,
        fullPath: context.currentPath,
        error: ERROR_MESSAGE.ARRAY_ITEMS_NOT_OBJECTS
      };
    }

    context.parentAttribute = arrayAttr;
    context.currentAttributes = itemAttr._def.shape;
    context.lastValidSegment = segment;
    context.attributeName = arrayName;
    return undefined;
  }

  /**
   * Handles a OneOf attribute in the path.
   * Determines whether the next segment is the discriminator,
   * or whether to scan through all possible cases for a valid match.
   *
   * @param attr - OneOf attribute
   * @param segment - Current segment name
   * @param cleanSegment - Cleaned segment without optional marker
   * @param context - Current validation context
   * @param remainingSegments - Remaining path segments
   */
  private processOneOfSegment(
    attr: OneOfAttribute<string, OneOfCase<string>[]>,
    segment: string,
    cleanSegment: string,
    context: ValidationContext,
    remainingSegments: string[]
  ): PathValidationResult | undefined {
    const nextSegment = remainingSegments[0];

    if (!nextSegment) {
      // Reached the end of path at OneOf node
      return {
        valid: true,
        parentAttribute: context.parentAttribute,
        lastValidSegment: segment,
        attributeName: cleanSegment,
        fullPath: context.currentPath,
        attribute: attr
      };
    }

    if (nextSegment === attr._def.discriminator) {
      return this.processDiscriminatorSegment(
        attr,
        nextSegment,
        context,
        remainingSegments.slice(1)
      );
    }

    return this.checkAllCases(
      attr,
      segment,
      cleanSegment,
      context,
      remainingSegments
    );
  }

  /**
   * Processes a path that enters the discriminator key of a OneOf.
   * Continues traversal inside one of the OneOf branches.
   *
   * @param attr - OneOf attribute
   * @param discriminatorSegment - The discriminator key
   * @param context - Validation context
   * @param remainingSegments - Remaining path after discriminator
   */
  private processDiscriminatorSegment(
    attr: OneOfAttribute<string, OneOfCase<string>[]>,
    discriminatorSegment: string,
    context: ValidationContext,
    remainingSegments: string[]
  ): PathValidationResult {
    context.currentPath += context.pathSeparator + discriminatorSegment;

    if (remainingSegments.length === 0) {
      return {
        valid: true,
        parentAttribute: attr,
        lastValidSegment: discriminatorSegment,
        attributeName: attr._def.discriminator,
        fullPath: context.currentPath,
        attribute: attr
      };
    }

    return this.checkCasesAfterDiscriminator(
      attr,
      discriminatorSegment,
      context,
      remainingSegments
    );
  }

  /**
   * Checks all cases of a OneOf to find one that matches the remaining path.
   *
   * @param attr - OneOf attribute
   * @param segment - Segment that matched OneOf key
   * @param cleanSegment - Cleaned name of OneOf key
   * @param context - Current validation context
   * @param remainingSegments - Remaining segments to resolve
   */
  private checkAllCases(
    attr: OneOfAttribute<string, OneOfCase<string>[]>,
    segment: string,
    cleanSegment: string,
    context: ValidationContext,
    remainingSegments: string[]
  ): PathValidationResult {
    for (const caseObj of attr._def.cases) {
      if (!(caseObj instanceof ObjectAttribute)) continue;

      const result = this.validatePathInShape(
        caseObj._def.shape,
        remainingSegments.join(context.pathSeparator),
        caseObj
      );

      if (result.valid) {
        return {
          valid: true,
          parentAttribute: result.parentAttribute,
          lastValidSegment: result.lastValidSegment || '',
          attributeName: result.attributeName || '',
          fullPath:
            context.currentPath +
            context.pathSeparator +
            remainingSegments.join(context.pathSeparator),
          attribute: result.attribute
        };
      }
    }

    return {
      valid: false,
      parentAttribute: attr,
      lastValidSegment: segment,
      attributeName: cleanSegment,
      fullPath: context.currentPath,
      error: ERROR_MESSAGE.NOT_FOUND_IN_ONEOF
    };
  }

  /**
   * Checks all OneOf cases after encountering the discriminator.
   * Useful when path looks like: "type.discriminator.deep.nested"
   *
   * @param attr - OneOf attribute
   * @param discriminatorSegment - Discriminator key
   * @param context - Context during traversal
   * @param remainingSegments - Remaining path after discriminator
   */
  private checkCasesAfterDiscriminator(
    attr: OneOfAttribute<string, OneOfCase<string>[]>,
    discriminatorSegment: string,
    context: ValidationContext,
    remainingSegments: string[]
  ): PathValidationResult {
    for (const caseObj of attr._def.cases) {
      if (!(caseObj instanceof ObjectAttribute)) continue;

      const result = this.validatePathInShape(
        caseObj._def.shape,
        remainingSegments.join(context.pathSeparator),
        caseObj
      );

      if (result.valid) {
        return {
          valid: true,
          parentAttribute: result.parentAttribute,
          lastValidSegment: result.lastValidSegment || '',
          attributeName: result.attributeName || '',
          fullPath:
            context.currentPath +
            context.pathSeparator +
            remainingSegments.join(context.pathSeparator),
          attribute: result.attribute
        };
      }
    }

    return {
      valid: false,
      parentAttribute: attr,
      lastValidSegment: discriminatorSegment,
      attributeName: attr._def.discriminator,
      fullPath: context.currentPath,
      error: ERROR_MESSAGE.NOT_FOUND_IN_ONEOF
    };
  }

  /**
   * Validates a nested path against an object shape (e.g., inside OneOf case).
   * This method is recursive and reuses path segment logic from root-level validation.
   *
   * @param shape - Object shape containing attributes
   * @param remainingPath - Remaining path (e.g., "field.nested.inner")
   * @param parentAttr - The parent attribute that owns the shape
   */
  private validatePathInShape(
    shape: Record<string, AnyAttribute>,
    remainingPath: string,
    parentAttr: AnyAttribute
  ): PathValidationResult {
    const segments = remainingPath.split(this.pathSeparator);

    const context: ValidationContext = {
      currentAttributes: shape,
      parentAttribute: parentAttr,
      currentPath: '',
      lastValidSegment: '',
      attributeName: '',
      pathSeparator: this.pathSeparator
    };

    for (let i = 0; i < segments.length; i++) {
      const segment = segments[i] || '';
      if (!segment) {
        return {
          valid: false,
          error: ERROR_MESSAGE.UNDEFINED_SEGMENT
        };
      }

      const isLast = i === segments.length - 1;
      const result = this.processPathSegment(
        segment,
        isLast,
        context,
        segments.slice(i + 1)
      );

      if (result) {
        return result;
      }
    }

    const lastSegment = segments.at(-1);
    return {
      valid: true,
      parentAttribute: context.parentAttribute,
      lastValidSegment: lastSegment,
      attributeName: lastSegment ? this.removeOptionalMarker(lastSegment) : '',
      fullPath: context.currentPath,
      attribute: lastSegment
        ? context.currentAttributes[this.removeOptionalMarker(lastSegment)]
        : undefined
    };
  }

  /**
   * Removes the optional marker ("?") from the end of a path segment, if present.
   *
   * @param pathSegment - Segment string (e.g. "field?" or "email")
   * @returns Segment without optional marker (e.g. "field")
   */
  private removeOptionalMarker(pathSegment: string): string {
    if (this.isOptionalSegment(pathSegment)) {
      return pathSegment.slice(0, -1);
    }
    return pathSegment;
  }

  /**
   * Checks if a path segment contains the optional marker ("?").
   *
   * @param pathSegment - Path segment string
   * @returns True if segment ends with "?", otherwise false
   */
  private isOptionalSegment(pathSegment: string): boolean {
    return pathSegment.endsWith(OPTIONAL_MARKER);
  }

  /**
   * Determines whether a given segment represents an array (e.g. "items[]").
   *
   * @param pathSegment - Path segment string
   * @returns True if segment ends with ARRAY_MARKER ("[]"), otherwise false
   */
  private isArraySegment(pathSegment: string): boolean {
    return pathSegment.endsWith(ARRAY_MARKER);
  }

  /**
   * Removes the array marker ("[]") from a path segment, if present.
   *
   * @param pathSegment - Path segment string (e.g. "items[]")
   * @returns Cleaned segment name (e.g. "items")
   */
  private removeArrayMarker(pathSegment: string): string {
    if (this.isArraySegment(pathSegment)) {
      return pathSegment.slice(0, -2);
    }
    return pathSegment;
  }
}
