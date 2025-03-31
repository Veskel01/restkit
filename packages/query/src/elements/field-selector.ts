import type { AnyResource } from '@restkit/core';
import { QueryElementType } from '../constants';
import type { ResourceSelectableFields } from '../types';
import { QueryElement, type QueryElementMetadata } from './query-element';

/**
 * Token responsible for selecting all fields from a resource
 */
export const SELECT_ALL_FIELDS_OPERATOR = '*' as const;

/**
 * Type representing selected fields from a resource
 * Can be either a special token for all fields or an array of specific field names
 */
export type SelectableFields<TResource extends AnyResource> =
  | typeof SELECT_ALL_FIELDS_OPERATOR
  | ResourceSelectableFields<TResource>[];

export interface FieldSelectorMetadata<
  TResource extends AnyResource,
  TFields extends SelectableFields<TResource>
> extends QueryElementMetadata<QueryElementType.SELECT> {
  readonly selectedFields: TFields;
}

/**
 * Query element responsible for defining which fields should be selected
 * from a given resource.
 *
 * Allows selecting either a specific subset of fields, or all selectable fields
 * using the special `SELECT_ALL_FIELDS_OPERATOR` token (`*`).
 *
 * Extends the abstract {@link QueryElement} class and contributes a `select` clause
 * to the query metadata.
 *
 * @typeParam TResource - The resource type this selector applies to
 * @typeParam TFields - The selected fields, either a list of keys or the all-fields token
 */
export class FieldSelector<
  TResource extends AnyResource,
  TFields extends
    SelectableFields<TResource> = typeof SELECT_ALL_FIELDS_OPERATOR
> extends QueryElement<TResource, FieldSelectorMetadata<TResource, TFields>> {
  readonly #selectedFields: TFields;

  public constructor(
    resource: TResource,
    selectedFields: TFields = SELECT_ALL_FIELDS_OPERATOR as TFields
  ) {
    super(resource);
    this.#selectedFields = selectedFields;
  }

  public getMetadata(): FieldSelectorMetadata<TResource, TFields> {
    return {
      type: QueryElementType.SELECT,
      selectedFields: this.#selectedFields
    };
  }

  /**
   * Selects specific fields from the resource.
   *
   * Performs validation to ensure all specified fields exist
   * and are marked as `selectable`.
   *
   * @param fields - List of field names to select
   * @returns A new FieldSelector instance with the selected fields
   *
   * @throws Error if any field does not exist or is not marked as selectable
   *
   * @example
   * selector.select('id', 'name');
   */
  public select<T extends ResourceSelectableFields<TResource>[]>(
    ...fields: T
  ): FieldSelector<TResource, T>;

  /**
   * Selects all fields from the resource.
   *
   * @param token - The `SELECT_ALL_FIELDS_OPERATOR` token (`*`)
   * @returns A new FieldSelector instance selecting all fields
   */
  public select<T extends typeof SELECT_ALL_FIELDS_OPERATOR>(
    token: T
  ): FieldSelector<TResource, T>;

  public select(
    ...args:
      | [typeof SELECT_ALL_FIELDS_OPERATOR]
      | ResourceSelectableFields<TResource>[]
  ): FieldSelector<TResource, SelectableFields<TResource>> {
    if (args.length === 1 && args[0] === SELECT_ALL_FIELDS_OPERATOR) {
      return new FieldSelector(
        this.resource,
        SELECT_ALL_FIELDS_OPERATOR
      ) as FieldSelector<TResource, typeof SELECT_ALL_FIELDS_OPERATOR>;
    }

    const fields = [...new Set(args as ResourceSelectableFields<TResource>[])];

    for (const field of fields) {
      if (!this.hasAttribute(field)) {
        throw new Error(
          `Field '${String(field)}' does not exist in resource '${this.resource.name}'`
        );
      }

      if (!this.isAttributeFlagSet(field, 'selectable')) {
        throw new Error(
          `Field '${String(field)}' is not selectable in resource '${this.resource.name}'`
        );
      }
    }

    return new FieldSelector(this.resource, fields) as FieldSelector<
      TResource,
      typeof fields
    >;
  }
}
