// import { type AnyResource, isEnumValue, isObject } from '@restkit/core';
// import { QueryElementType } from '../constants';
// import type { ResourceSortableFields } from '../types';
// import { QueryElement, type QueryElementMetadata } from './query-element';

// export enum SortDirection {
//   ASC = 'asc',
//   DESC = 'desc'
// }

// export type SortMap<TResource extends AnyResource> = {
//   [K in ResourceSortableFields<TResource>]?: SortDirection;
// };

// export type SortInputMap<TResource extends AnyResource> = {
//   [K in ResourceSortableFields<TResource>]?:
//     | SortDirection
//     | keyof typeof SortDirection;
// };

// export type SortSelectorMetadata<
//   TResource extends AnyResource,
//   TSort extends SortMap<TResource>
// > = QueryElementMetadata<QueryElementType.SORT, TSort>;

// export type MergeSortMapBehavior = 'replace' | 'merge';

// /**
//  * Query element responsible for defining sort order for a resource.
//  *
//  * Allows specifying sorting either for multiple fields using a map,
//  * or for a single field with direction.
//  *
//  *
//  * Extends the abstract {@link QueryElement} class and contributes a `sort` clause
//  * to the query metadata.
//  *
//  * @typeParam TResource - The resource type this selector applies to
//  * @typeParam TSort - The map of sortable fields and their directions
//  *
//  * @example
//  * const sort = new SortSelector(userResource)
//  *   .sortBy('createdAt', 'desc')
//  *   .sortBy({ name: 'asc' })
//  *   .sortBy('role', 'ASC')
//  */
// export class SortSelector<
//   TResource extends AnyResource,
//   TSort extends SortMap<TResource>
// > extends QueryElement<
//   TResource,
//   TSort,
//   SortSelectorMetadata<TResource, TSort>
// > {
//   readonly #sortMap: Map<ResourceSortableFields<TResource>, SortDirection> =
//     new Map();

//   public constructor(resource: TResource, sortMap: TSort = {} as TSort) {
//     super(resource);
//     this.#sortMap = new Map(
//       Object.entries(sortMap) as [
//         ResourceSortableFields<TResource>,
//         SortDirection
//       ][]
//     );
//   }

//   public getMetadata(): SortSelectorMetadata<TResource, TSort> {
//     return {
//       type: QueryElementType.SORT,
//       value: Object.fromEntries(this.#sortMap) as TSort
//     };
//   }

//   /**
//    * Specifies the sort order using a map of fields and directions.
//    *
//    * @example
//    * selector.sortBy({ name: 'asc', createdAt: 'desc' });
//    *
//    * @param sort - Object mapping field names to directions (asc/desc)
//    * @returns A new SortSelector instance with the merged sort definition
//    *
//    * @throws Error if any field is not sortable
//    */
//   public sortBy<T extends SortInputMap<TResource>>(
//     sort: T
//   ): SortSelector<
//     TResource,
//     {
//       [K in keyof T]: SortDirection;
//     }
//   >;

//   /**
//    * Specifies the sort order for a single field.
//    *
//    * @example
//    * selector.sortBy('name', 'asc');
//    *
//    * @param key - Field to sort by
//    * @param direction - Direction to sort (asc/desc or equivalent string)
//    * @returns A new SortSelector instance with the merged sort definition
//    *
//    * @throws Error if the field is not sortable
//    */
//   public sortBy<K extends ResourceSortableFields<TResource>>(
//     key: K,
//     direction: SortDirection | keyof typeof SortDirection
//   ): SortSelector<TResource, { [P in K]: SortDirection } & SortMap<TResource>>;

//   public sortBy(
//     ...args:
//       | [SortInputMap<TResource>]
//       | [
//           ResourceSortableFields<TResource>,
//           SortDirection | keyof typeof SortDirection
//         ]
//   ): SortSelector<TResource, SortMap<TResource>> {
//     const sortMap: Record<string, SortDirection> = {};

//     let sortObj: SortInputMap<TResource> = {};

//     if (args.length === 1 && isObject(args[0])) {
//       sortObj = args[0] as SortInputMap<TResource>;
//     }

//     if (args.length === 2) {
//       const field = args[0] as string;
//       const dir = this.normalizeSortDirection(
//         args[1] as SortDirection | keyof typeof SortDirection
//       );

//       sortObj = { [field]: dir } as SortInputMap<TResource>;
//     }

//     for (const [field, dir] of Object.entries(sortObj)) {
//       if (!this.isFieldSortable(field)) {
//         throw new Error(`Field '${field}' is not sortable`);
//       }

//       sortMap[field] = this.normalizeSortDirection(
//         dir as SortDirection | keyof typeof SortDirection
//       );
//     }

//     return new SortSelector(this.resource, this.mergeSortMap(sortMap));
//   }

//   /**
//    * Normalizes a sort direction value (enum or string) into a `SortDirection` enum.
//    *
//    * @param dir - The raw sort direction
//    * @returns Normalized `SortDirection` enum value
//    */
//   private normalizeSortDirection(
//     dir: SortDirection | keyof typeof SortDirection
//   ): SortDirection {
//     if (isEnumValue(dir, SortDirection)) {
//       return dir;
//     }

//     return SortDirection[dir];
//   }

//   /**
//    * Validates if a given field is marked as sortable.
//    *
//    * @param field - Field name to check
//    * @returns `true` if the field is sortable
//    */
//   private isFieldSortable(field: string): boolean {
//     return this.isAttributeFlagSet(field, 'sortable');
//   }

//   /**
//    * Merges the current sort map with new entries.
//    * New fields overwrite existing ones by default.
//    *
//    * @param sortMap - The additional sort map to merge
//    * @param duplicateBehavior - Determines whether to replace or keep existing fields
//    * @returns A new sort map (TSort) with merged values
//    */
//   private mergeSortMap(
//     sortMap: Record<string, SortDirection>,
//     duplicateBehavior: 'replace' | 'merge' = 'replace'
//   ): TSort {
//     const current = Object.fromEntries(this.#sortMap);

//     const merged = { ...current };

//     for (const [field, direction] of Object.entries(sortMap)) {
//       const alreadyExists = field in current;

//       if (duplicateBehavior === 'replace' || !alreadyExists) {
//         merged[field] = direction;
//       }
//     }

//     return merged as TSort;
//   }
// }
