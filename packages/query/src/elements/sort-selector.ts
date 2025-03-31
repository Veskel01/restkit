import { type AnyResource, isEnumValue, isObject } from '@restkit/core';
import { QueryElementType } from '../constants';
import type { ResourceSortableFields } from '../types';
import { QueryElement, type QueryElementMetadata } from './query-element';

export enum SortDirection {
  ASC = 'asc',
  DESC = 'desc'
}

export type SortMap<TResource extends AnyResource> = {
  [K in ResourceSortableFields<TResource>]?: SortDirection;
};

export type SortInputMap<TResource extends AnyResource> = {
  [K in ResourceSortableFields<TResource>]?:
    | SortDirection
    | keyof typeof SortDirection;
};

export interface SortSelectorMetadata<
  TResource extends AnyResource,
  TSort extends SortMap<TResource>
> extends QueryElementMetadata<QueryElementType.SORT> {
  readonly sort: TSort;
}

export class SortSelector<
  TResource extends AnyResource,
  TSort extends SortMap<TResource>
> extends QueryElement<TResource, SortSelectorMetadata<TResource, TSort>> {
  readonly #sortMap: Map<ResourceSortableFields<TResource>, SortDirection> =
    new Map();

  public constructor(resource: TResource, sortMap: TSort = {} as TSort) {
    super(resource);
    this.#sortMap = new Map(
      Object.entries(sortMap) as [
        ResourceSortableFields<TResource>,
        SortDirection
      ][]
    );
  }

  public getMetadata(): SortSelectorMetadata<TResource, TSort> {
    return {
      type: QueryElementType.SORT,
      sort: Object.fromEntries(this.#sortMap) as TSort
    };
  }

  /**
   * Specifies the sort order for the query using a map of fields and directions.
   *
   * @example
   * query.sortBy({ createdAt: 'desc', name: 'asc' });
   *
   * @param sort - An object mapping sortable field names to directions
   * @returns A SortSelector instance representing the configured sort definition
   */
  public sortBy<T extends SortInputMap<TResource>>(
    sort: T
  ): SortSelector<
    TResource,
    {
      [K in keyof T]: SortDirection;
    }
  >;

  /**
   * Specifies the sort order for a single field.
   *
   * @example
   * query.sortBy('createdAt', 'desc');
   *
   * @param key - The field to sort by
   * @param direction - The direction to sort (asc or desc)
   * @returns A SortSelector instance representing the configured sort definition
   */
  public sortBy<K extends ResourceSortableFields<TResource>>(
    key: K,
    direction: SortDirection | keyof typeof SortDirection
  ): SortSelector<TResource, { [P in K]: SortDirection } & SortMap<TResource>>;

  public sortBy(
    ...args:
      | [SortInputMap<TResource>]
      | [
          ResourceSortableFields<TResource>,
          SortDirection | keyof typeof SortDirection
        ]
  ): SortSelector<TResource, SortMap<TResource>> {
    const sortMap: Record<string, SortDirection> = {};

    let sortObj: SortInputMap<TResource> = {};

    if (args.length === 1 && isObject(args[0])) {
      sortObj = args[0] as SortInputMap<TResource>;
    }

    if (args.length === 2) {
      const field = args[0] as string;
      const dir = this.normalizeSortDirection(
        args[1] as SortDirection | keyof typeof SortDirection
      );

      sortObj = { [field]: dir } as SortInputMap<TResource>;
    }

    for (const [field, dir] of Object.entries(sortObj)) {
      if (!this.isFieldSortable(field)) {
        throw new Error(`Field '${field}' is not sortable`);
      }

      sortMap[field] = this.normalizeSortDirection(
        dir as SortDirection | keyof typeof SortDirection
      );
    }

    return new SortSelector(this.resource, this.mergeSortMap(sortMap));
  }

  private normalizeSortDirection(
    dir: SortDirection | keyof typeof SortDirection
  ): SortDirection {
    if (isEnumValue(dir, SortDirection)) {
      return dir;
    }

    return SortDirection[dir];
  }

  private isFieldSortable(field: string): boolean {
    return this.isAttributeFlagSet(field, 'sortable');
  }

  private mergeSortMap(sortMap: Record<string, SortDirection>): TSort {
    return {
      ...Object.fromEntries(this.#sortMap),
      ...sortMap
    } as TSort;
  }
}
