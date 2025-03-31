import type { AnyResource, AttributeFlags } from '@restkit/core';
import type { QueryElementType } from '../constants';

export interface QueryElementMetadata<TType extends QueryElementType, TValue> {
  type: TType;
  value: TValue;
}

/**
 * Abstract base class representing a single element of a query,
 * such as selection, filtering, sorting, pagination, or population.
 *
 * @typeParam TResource - The resource type that this query element operates on
 * @typeParam TMetadata - The shape of the metadata returned by `getMetadata()`
 */
export abstract class QueryElement<
  TResource extends AnyResource,
  TMetadataValue,
  TMetadata extends QueryElementMetadata<QueryElementType, TMetadataValue>
> {
  readonly #resource: TResource;

  protected constructor(resource: TResource) {
    this.#resource = resource;
  }

  protected get resource(): Readonly<TResource> {
    return this.#resource;
  }

  /**
   * Returns the metadata representing the query element's contribution to the final query.
   * This metadata is typically used for serializing the query or transforming it into
   * a format compatible with a backend API.
   */
  public abstract getMetadata(): TMetadata;

  /**
   * Checks if a specific flag is set to `true` on a given attribute.
   *
   * @param field - The field to inspect
   * @param flag - The attribute flag to check (e.g., `selectable`, `filterable`, `sortable`)
   * @returns `true` if the flag is set, otherwise `false`
   */

  protected isAttributeFlagSet<
    TField extends keyof TResource['attributes'],
    TFlag extends keyof AttributeFlags
  >(field: TField, flag: TFlag): boolean {
    // TODo - implement this with nested paths handling

    throw new Error('Not implemented');

    // if (!this.hasAttribute(field)) {
    //   return false;
    // }

    // const attribute = this.getAttribute(field);

    // if (!attribute) {
    //   return false;
    // }

    // return attribute._flags[flag] === true;
  }
}
