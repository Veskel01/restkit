import type {
  AnyAttribute,
  InferAttributeOutput
} from '../attributes/attribute';

/**
 * A map of attribute definitions keyed by attribute names.
 * Each value must be a valid `AnyAttribute` instance.
 */
export type ResourceAttributes = Record<string, AnyAttribute>;

/**
 * A generic resource definition used internally and for inference.
 * Consists of a resource `name` and a map of typed `attributes`.
 */
export type AnyResource = Resource<string, ResourceAttributes>;

/**
 * A map of named resources. Each key is the resource name,
 * and each value is a `Resource` instance.
 */
export type ResourceMap = Record<string, AnyResource>;

/**
 * Infers the TypeScript output shape from a given `Resource` definition.
 * Converts each attribute into its proper type, while respecting
 * optional and nullable flags.
 *
 * @template T - A resource instance
 *
 * @example
 * ```ts
 * const user = resource('user', {
 *   id: numberAttr(),
 *   name: stringAttr().optional(),
 *   email: stringAttr().nullable()
 * });
 *
 * type UserOutput = InferResourceOutput<typeof user>;
 * // {
 * //   id: number;
 * //   name?: string;
 * //   email: string | null;
 * // }
 * ```
 */
export type InferResourceOutput<
  T extends Resource<string, ResourceAttributes>
> = {
  [K in keyof T['attributes']]: InferAttributeOutput<T['attributes'][K]>;
};

/**
 * Extracts the name of a given resource.
 *
 * @template T - A resource instance
 *
 * @example
 * ```ts
 * type Name = GetResourceName<typeof user>; // "user"
 * ```
 */
export type GetResourceName<T extends Resource<string, ResourceAttributes>> =
  T extends Resource<infer TName, ResourceAttributes> ? TName : never;

/**
 * Represents a RESTful resource definition with a fixed name and a set of attributes.
 *
 * Used throughout the system to define entities like "user", "post", etc.,
 * along with their strongly typed schema.
 *
 * @template TName - The unique name of the resource (e.g. "user")
 * @template TAttributes - A map of attribute definitions
 */
export class Resource<
  TName extends string,
  TAttributes extends ResourceAttributes
> {
  /** The unique name of the resource (e.g. "user", "post") */
  public readonly name: TName;

  /** The map of attributes describing the structure of this resource */
  public readonly attributes: TAttributes;

  /**
   * Private constructor. Use `Resource.define` or `resource(...)` helper instead.
   */
  private constructor(name: TName, attributes: TAttributes) {
    this.name = name;
    this.attributes = attributes;
  }

  /**
   * Defines a new resource with a name and attributes.
   *
   * @param name - The name of the resource
   * @param attributes - The attribute definitions for the resource
   * @returns A new `Resource` instance
   *
   * @example
   * ```ts
   * const post = Resource.define('post', {
   *   id: numberAttr(),
   *   title: stringAttr()
   * });
   * ```
   */
  public static define<
    TName extends string,
    TAttributes extends ResourceAttributes
  >(name: TName, attributes: TAttributes): Resource<TName, TAttributes> {
    return new Resource(name, attributes);
  }
}

/**
 * Defines a new resource using a functional helper.
 * Equivalent to `Resource.define(...)`, but shorter.
 *
 * @param name - The name of the resource
 * @param attributes - The attribute definitions
 * @returns A new `Resource` instance
 *
 * @example
 * ```ts
 * const user = resource('user', {
 *   id: numberAttr(),
 *   email: stringAttr()
 * });
 * ```
 */
export function resource<
  TName extends string,
  TAttributes extends ResourceAttributes
>(name: TName, attributes: TAttributes): Resource<TName, TAttributes> {
  return Resource.define(name, attributes);
}
