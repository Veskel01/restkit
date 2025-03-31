import { type AnyResource, isEnumValue } from '@restkit/core';
import { QueryElementType, SortDirection } from '../constants';
import type { ResourceSortableFields } from '../types';
import { QueryElement, type QueryElementMetadata } from './query-element';

/**
 * Represents a mapping of sortable fields to their corresponding sort directions.
 *
 * The keys are attribute names marked as `sortable` in the resource definition,
 * and the values are `SortDirection` values (`asc` or `desc`).
 *
 * @typeParam TResource - The resource from which sortable fields are derived
 */
export type SortMap<TResource extends AnyResource> = {
  [K in ResourceSortableFields<TResource>]?: SortDirection;
};

/**
 * Metadata returned by the `SortSelector` as part of the query definition.
 *
 * @typeParam TResource - The resource the sort applies to
 * @typeParam TSort - The sort map structure with normalized directions
 */
export type SortSelectorMetadata<
  TResource extends AnyResource,
  TSort extends SortMap<TResource>
> = QueryElementMetadata<QueryElementType.SORT, TSort>;

/**
 * Normalizes sort direction from string literals (`"ASC"` / `"DESC"`)
 * into the canonical `SortDirection` enum.
 */
type MapSortDirection<
  TDirection extends SortDirection | keyof typeof SortDirection
> = TDirection extends SortDirection
  ? TDirection
  : TDirection extends 'ASC'
    ? SortDirection.ASC
    : TDirection extends 'DESC'
      ? SortDirection.DESC
      : never;

/**
 * Produces a new sort map type by adding or replacing a single field-direction pair.
 *
 * @typeParam TResource - Resource type
 * @typeParam TSort - Current sort map
 * @typeParam TField - Field to update or add
 * @typeParam TDirection - Direction for the specified field
 */
type SetSortMapField<
  TResource extends AnyResource,
  TSort extends SortMap<TResource>,
  TField extends ResourceSortableFields<TResource>,
  TDirection extends SortDirection | keyof typeof SortDirection
> = {
  [P in keyof TSort as P extends TField ? never : P]: TSort[P];
} & {
  [P in TField]: MapSortDirection<TDirection>;
};

/**
 * Query element responsible for defining sort order for a specific resource.
 *
 * Supports fluent API for adding multiple field-direction pairs,
 * and ensures compile-time validation of sortable fields and directions.
 *
 * This selector is immutable — each `.sortBy(...)` call returns a new type
 * reflecting the updated sort definition.
 *
 * @typeParam TResource - The resource the selector is scoped to
 * @typeParam TSort - Current accumulated sort map
 *
 * @example
 * const sort = new SortSelector(userResource)
 *   .sortBy('createdAt', 'desc')
 *   .sortBy('email', 'asc');
 */
export class SortSelector<
  TResource extends AnyResource,
  TSort extends SortMap<TResource>
> extends QueryElement<
  TResource,
  TSort,
  SortSelectorMetadata<TResource, TSort>
> {
  readonly #sortMap: Map<ResourceSortableFields<TResource>, SortDirection> =
    new Map();

  public constructor(resource: TResource) {
    super(resource);
  }

  public getMetadata(): SortSelectorMetadata<TResource, TSort> {
    return {
      type: QueryElementType.SORT,
      value: Object.fromEntries(this.#sortMap) as TSort
    };
  }

  /**
   * Appends a sortable field and its direction to the sort definition.
   *
   * @param field - A field marked as `sortable` in the resource
   * @param direction - The sort direction (`asc`, `desc`, or equivalent string)
   * @returns A new instance of `SortSelector` with updated generic type
   *
   * @example
   * selector.sortBy('createdAt', 'desc');
   */
  public sortBy<
    K extends ResourceSortableFields<TResource>,
    TDirection extends SortDirection | keyof typeof SortDirection
  >(
    field: K,
    direction: TDirection
  ): SortSelector<TResource, SetSortMapField<TResource, TSort, K, TDirection>> {
    const dirValue = this.normalizeDirection(direction);

    // TODO - add check if field is sortable

    this.#sortMap.set(field, dirValue);
    return this as unknown as SortSelector<
      TResource,
      SetSortMapField<TResource, TSort, K, TDirection>
    >;
  }

  private normalizeDirection(
    direction: SortDirection | keyof typeof SortDirection
  ): SortDirection {
    return isEnumValue(direction, SortDirection)
      ? direction
      : SortDirection[direction];
  }
}
