import type { AnyResource, AttributeFlags } from '@restkit/core';
import type { QueryElementType } from '../constants';

export interface QueryElementMetadata<TType extends QueryElementType> {
  type: TType;
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
  TMetadata extends QueryElementMetadata<QueryElementType>
> {
  readonly #resource: TResource;

  protected constructor(resource: TResource) {
    this.#resource = resource;
  }

  protected get resource(): TResource {
    return this.#resource;
  }

  /**
   * Returns the metadata representing the query element's contribution to the final query.
   * This metadata is typically used for serializing the query or transforming it into
   * a format compatible with a backend API.
   */
  public abstract getMetadata(): TMetadata;

  /**
   * Checks if a field exists in the resource's attributes
   * @param field The field name to check
   * @returns True if the field exists in the resource's attributes
   */
  protected hasAttribute<K extends keyof TResource['attributes']>(
    field: K
  ): boolean {
    return field in this.#resource.attributes;
  }

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
    if (!this.hasAttribute(field)) {
      return false;
    }

    const attribute = this.#resource.attributes[field as never];

    if (!attribute) {
      return false;
    }

    return attribute._flags[flag] === true;
  }

  /**
   * Returns the names of all attributes that have a specific flag set to `true`.
   *
   * @param flag - The attribute flag to filter by
   * @returns An array of attribute names with the specified flag enabled
   */
  protected getAttributesWithFlag<TFlag extends keyof AttributeFlags>(
    flag: TFlag
  ): Array<keyof TResource['attributes']> {
    return Object.keys(this.#resource.attributes).filter((attribute) =>
      this.isAttributeFlagSet(attribute, flag)
    );
  }
}
