import type {
  AnyAttribute,
  InferAttributeOutput
} from '../attributes/attribute';

export type ResourceAttributes = Record<string, AnyAttribute>;

export type AnyResource = Resource<string, ResourceAttributes>;

export type ResourceMap = Record<string, AnyResource>;

/**
 * Infers a TypeScript interface from a Resource definition.
 * This type transforms attribute definitions into their corresponding TypeScript types,
 * while preserving nullable and optional flags.
 */
export type InferResourceOutput<
  T extends Resource<string, ResourceAttributes>
> = {
  [K in keyof T['attributes']]: InferAttributeOutput<T['attributes'][K]>;
};

/**
 * Extracts the name type for a specific resource.
 */
export type GetResourceName<T extends Resource<string, ResourceAttributes>> =
  T extends Resource<infer TName, ResourceAttributes> ? TName : never;

export class Resource<
  TName extends string,
  TAttributes extends ResourceAttributes
> {
  public readonly name: TName;
  public readonly attributes: TAttributes;

  private constructor(name: TName, attributes: TAttributes) {
    this.name = name;
    this.attributes = attributes;
  }

  public static define<
    TName extends string,
    TAttributes extends ResourceAttributes
  >(name: TName, attributes: TAttributes): Resource<TName, TAttributes> {
    return new Resource(name, attributes);
  }
}

export function resource<
  TName extends string,
  TAttributes extends ResourceAttributes
>(name: TName, attributes: TAttributes): Resource<TName, TAttributes> {
  return Resource.define(name, attributes);
}
