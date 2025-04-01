import type { AttributeMap, InferAttributeOutput } from '../../attributes';

/**
 * A generic resource definition used internally and for inference.
 * Consists of a resource `name` and a map of typed `attributes`.
 */
export type AnyResource = Resource<string, AttributeMap>;

/**
 * A map of named resources. Each key is the resource name,
 * and each value is a `Resource` instance.
 */
export type ResourceMap = Record<string, AnyResource>;

/**
 * Infers the TypeScript output shape from a given `Resource` definition.
 * Converts each attribute into its proper type, while respecting flags.
 *
 * @template T - A resource instance
 */
export type InferResourceShape<T extends AnyResource> = {
  [K in keyof T['attributes']]: InferAttributeOutput<T['attributes'][K]>;
};

/**
 * Extracts the name of a resource from its instance.
 *
 * @template T - A resource instance
 */
export type GetResourceName<T extends AnyResource> = T['name'] & string;

/**
 * Represents a RESTful resource definition with a fixed name and a set of attributes.
 *
 * Used throughout the system to define resources like "user", "post", etc.,
 * along with their strongly typed schema.
 *
 * @template TName - The unique name of the resource (e.g. "user")
 * @template TAttributes - A map of attribute definitions
 */
export class Resource<TName extends string, TAttributes extends AttributeMap> {
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
   * Static factory method to create a new resource.
   *
   * @param name - The name of the resource
   * @param attributes - The attribute definitions for the resource
   * @returns A new `Resource` instance
   */
  public static create<TName extends string, TAttributes extends AttributeMap>(
    name: TName,
    attributes: TAttributes
  ): Resource<TName, TAttributes> {
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
  TAttributes extends AttributeMap
>(name: TName, attributes: TAttributes): Resource<TName, TAttributes> {
  return Resource.create(name, attributes);
}
