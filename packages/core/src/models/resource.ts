import type { ArrayAttribute } from '../attributes/array';
import type {
  AnyAttribute,
  AttributeFlags,
  InferAttributeFlags,
  InferAttributeOutput
} from '../attributes/attribute';
import type {
  ObjectAttribute,
  ObjectAttributeShape
} from '../attributes/object';
import type { ARRAY_MARKER, DEFAULT_PATH_SEPARATOR } from '../constants';
import type { ExtractProperty } from '../types/utility.type';

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
 * Generic type for inferring the output shape from a structure with attributes
 *
 * @template T - The structure containing attributes
 * @template TAttributesKey - The key where attributes are stored (default: 'attributes')
 */
export type InferShapeFromAttributes<
  T extends { [K in TAttributesKey]: Record<string, AnyAttribute> },
  TAttributesKey extends string = 'attributes'
> = {
  [K in keyof T[TAttributesKey]]: InferAttributeOutput<T[TAttributesKey][K]>;
};

/**
 * Infers the TypeScript output shape from a given `Resource` definition.
 * Converts each attribute into its proper type, while respecting flags.
 *
 * @template T - A resource instance
 */
export type InferResourceShape<T extends Resource<string, ResourceAttributes>> =
  InferShapeFromAttributes<T>;

/**
 * Extracts the name of a given resource.
 *
 * @template T - A resource instance
 */
export type GetResourceName<T extends Resource<string, ResourceAttributes>> =
  ExtractProperty<T, 'name'> & string;

/**
 * Extracts the output type of a resource attribute.
 *
 * @template TResource - The resource type
 * @template TKey - The attribute key
 */
export type InferResourceAttributeOutput<
  TResource extends AnyResource,
  TKey extends keyof TResource['attributes']
> = InferAttributeOutput<TResource['attributes'][TKey]>;

export type ArrayMarker = typeof ARRAY_MARKER;

/**
 * Marks a string as an array.
 *
 * @template T - The string to mark as an array
 */
export type MarkAsArray<T extends string> = `${T}${ArrayMarker}`;

/**
 * Recursively extracts paths for all attributes in a resource
 */
export type ExtractPaths<
  TAttributes extends Record<string, AnyAttribute>,
  TPrefix extends string = '',
  TSeparator extends string = typeof DEFAULT_PATH_SEPARATOR
> = {
  [K in keyof TAttributes]: TAttributes[K] extends ArrayAttribute<infer TItem>
    ? TItem extends AnyAttribute
      ? TItem extends ObjectAttribute<infer TShape>
        ?
            | (TPrefix extends ''
                ? `${MarkAsArray<K & string>}`
                : `${TPrefix}${TSeparator}${MarkAsArray<K & string>}`)
            | ExtractPaths<
                TShape,
                TPrefix extends ''
                  ? `${MarkAsArray<K & string>}`
                  : `${TPrefix}${TSeparator}${MarkAsArray<K & string>}`,
                TSeparator
              >
        : TPrefix extends ''
          ? `${MarkAsArray<K & string>}`
          : `${TPrefix}${TSeparator}${MarkAsArray<K & string>}`
      : never
    : TAttributes[K] extends ObjectAttribute<infer TShape>
      ?
          | (TPrefix extends ''
              ? `${K & string}`
              : `${TPrefix}${TSeparator}${K & string}`)
          | ExtractPaths<
              TShape,
              TPrefix extends ''
                ? `${K & string}`
                : `${TPrefix}${TSeparator}${K & string}`,
              TSeparator
            >
      : TPrefix extends ''
        ? `${K & string}`
        : `${TPrefix}${TSeparator}${K & string}`;
}[keyof TAttributes];

/**
 * Extracts all the paths and nested paths in given resource.
 *
 * @template TResource - The resource type
 * @template TSeparator - The separator for the path
 */
export type ResourcePath<
  TResource extends AnyResource,
  TSeparator extends string = typeof DEFAULT_PATH_SEPARATOR
> = ExtractPaths<TResource['attributes'], '', TSeparator>;

/**
 * Utility type to navigate through a nested structure using a path
 *
 * @template TObj - The object to navigate
 * @template TPath - The path string
 * @template TSeparator - The separator used in the path
 */
/**
 * Utility type to navigate through a nested structure using a path
 * with support for array[] notation
 */
type NavigateByPath<
  TObj,
  TPath extends string,
  TSeparator extends string
> = TPath extends `${infer Head}${TSeparator}${infer Tail}`
  ? Head extends `${infer ArrayName}${ArrayMarker}`
    ? ArrayName extends keyof TObj
      ? TObj[ArrayName] extends (infer TItem)[]
        ? NavigateByPath<TItem, Tail, TSeparator>
        : never
      : never
    : Head extends keyof TObj
      ? NavigateByPath<TObj[Head], Tail, TSeparator>
      : never
  : TPath extends `${infer ArrayName}${ArrayMarker}`
    ? ArrayName extends keyof TObj
      ? TObj[ArrayName] extends (infer TItem)[]
        ? TItem
        : never
      : never
    : TPath extends keyof TObj
      ? TObj[TPath]
      : never;

/**
 * Gets the type of a value at a specific path in a resource
 */
export type ResourceValueByPath<
  TResource extends AnyResource,
  TPath extends ResourcePath<TResource, TSeparator>,
  TSeparator extends string = typeof DEFAULT_PATH_SEPARATOR
> = TPath extends `${infer Head}${TSeparator}${infer Tail}`
  ? Head extends `${infer ArrayName}${ArrayMarker}`
    ? ArrayName extends keyof InferResourceShape<TResource>
      ? InferResourceShape<TResource>[ArrayName] extends (infer TItem)[]
        ? Tail extends ''
          ? TItem
          : NavigateByPath<TItem, Tail, TSeparator>
        : never
      : never
    : Head extends keyof InferResourceShape<TResource>
      ? NavigateByPath<InferResourceShape<TResource>[Head], Tail, TSeparator>
      : never
  : TPath extends `${infer ArrayName}${ArrayMarker}`
    ? ArrayName extends keyof InferResourceShape<TResource>
      ? InferResourceShape<TResource>[ArrayName] extends (infer TItem)[]
        ? TItem
        : never
      : never
    : TPath extends keyof InferResourceShape<TResource>
      ? InferResourceShape<TResource>[TPath]
      : never;

/**
 * Utility to navigate through attributes using a path
 */
type NavigateAttributePath<
  TAttributes extends Record<string, AnyAttribute>,
  TPath extends string,
  TSeparator extends string
> = TPath extends `${infer Head}${TSeparator}${infer Tail}`
  ? Head extends `${infer ArrayName}${ArrayMarker}`
    ? ArrayName extends keyof TAttributes
      ? TAttributes[ArrayName] extends ArrayAttribute<infer TItem>
        ? TItem extends ObjectAttribute<infer TShape>
          ? TShape extends ObjectAttributeShape
            ? NavigateAttributePath<TShape, Tail, TSeparator>
            : never
          : never
        : never
      : never
    : Head extends keyof TAttributes
      ? TAttributes[Head] extends ObjectAttribute<infer TShape>
        ? TShape extends ObjectAttributeShape
          ? NavigateAttributePath<TShape, Tail, TSeparator>
          : never
        : never
      : never
  : TPath extends `${infer ArrayName}${ArrayMarker}`
    ? ArrayName extends keyof TAttributes
      ? TAttributes[ArrayName] extends ArrayAttribute<infer TItem>
        ? TItem
        : never
      : never
    : TPath extends keyof TAttributes
      ? TAttributes[TPath]
      : never;

/**
 * Gets the attribute at a specific path, handling nested objects and arrays
 */
export type GetAttributeAtPath<
  TAttributes extends Record<string, AnyAttribute>,
  TPath extends string,
  TSeparator extends string
> = NavigateAttributePath<TAttributes, TPath, TSeparator>;

/**
 * Gets the attribute flags for an attribute at a specific path in a resource
 * Supports nested objects and arrays of objects
 */
export type ResourceFlagsByPath<
  TResource extends AnyResource,
  TPath extends ResourcePath<TResource, TSeparator>,
  TSeparator extends string = typeof DEFAULT_PATH_SEPARATOR
> = InferAttributeFlags<
  GetAttributeAtPath<TResource['attributes'], TPath, TSeparator>
>;

/**
 * Filters resource paths based on a specific attribute flag value
 */
export type ResourcePathsByFlag<
  TResource extends AnyResource,
  TFlag extends keyof AttributeFlags,
  TValue extends boolean = true,
  TSeparator extends string = typeof DEFAULT_PATH_SEPARATOR
> = {
  [P in ResourcePath<TResource, TSeparator>]: ResourceFlagsByPath<
    TResource,
    P extends ResourcePath<TResource, TSeparator> ? P : never,
    TSeparator
  >[TFlag] extends TValue
    ? P
    : never;
}[ResourcePath<TResource, TSeparator>];

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
 */
export function resource<
  TName extends string,
  TAttributes extends ResourceAttributes
>(name: TName, attributes: TAttributes): Resource<TName, TAttributes> {
  return Resource.define(name, attributes);
}
