// import {
//   type AnyAttribute,
//   type AnyConnectedRelations,
//   type AnyResource,
//   type ArrayRelationshipMap,
//   type AttributeFlags,
//   type ConnectedRelations,
//   type GetResourceName,
//   RelationCardinality,
//   type RelationGraph,
//   type RelationshipConnector,
//   type ResourceMap,
//   createRelationGraph
// } from '@restkit/core';

// // TODO - complete query

// /**
//  * Represents a query parameter type
//  */
// export enum QueryParamType {
//   Select = 'select',
//   Filter = 'filter',
//   Sort = 'sort',
//   Populate = 'populate',
//   Pagination = 'pagination'
// }

// /**
//  * Base interface for all query parameters
//  */
// export interface QueryParam<T extends QueryParamType> {
//   type: T;
// }

// /**
//  * Sort direction for sort parameters
//  */
// export enum SortDirection {
//   Asc = 'asc',
//   Desc = 'desc'
// }

// /**
//  * Defines field selection parameters
//  */
// export interface SelectParam extends QueryParam<QueryParamType.Select> {
//   fields: string[];
// }

// /**
//  * Defines filter criteria for queries
//  */
// export interface FilterParam extends QueryParam<QueryParamType.Filter> {
//   criteria: Record<string, unknown>;
// }

// /**
//  * Defines sort parameters for queries
//  */
// export interface SortParam extends QueryParam<QueryParamType.Sort> {
//   fields: Record<string, SortDirection>;
// }

// /**
//  * Defines pagination parameters for queries
//  */
// export interface PaginationParam extends QueryParam<QueryParamType.Pagination> {
//   page?: number;
//   limit?: number;
//   offset?: number;
// }

// /**
//  * Defines relations to populate in queries
//  */
// export interface PopulateParam extends QueryParam<QueryParamType.Populate> {
//   relations: Record<string, QueryParams>;
// }

// /**
//  * Represents a complete set of query parameters
//  */
// export interface QueryParams {
//   select?: SelectParam;
//   filter?: FilterParam;
//   sort?: SortParam;
//   pagination?: PaginationParam;
//   populate?: PopulateParam;
// }

// /**
//  * Type to extract attribute names with specific flag
//  */
// export type AttributeNamesWithFlag<
//   TResource extends AnyResource,
//   TFlag extends keyof AttributeFlags,
//   TValue extends boolean = true
// > = {
//   [K in keyof TResource['attributes']]: TResource['attributes'][K]['_flags'][TFlag] extends TValue
//     ? K
//     : never;
// }[keyof TResource['attributes']];

// /**
//  * Type to extract selectable attribute names from a resource
//  */
// export type SelectableFields<TResource extends AnyResource> =
//   AttributeNamesWithFlag<TResource, 'selectable'>;

// /**
//  * Type to extract filterable attribute names from a resource
//  */
// export type FilterableFields<TResource extends AnyResource> =
//   AttributeNamesWithFlag<TResource, 'filterable'>;

// /**
//  * Type to extract sortable attribute names from a resource
//  */
// export type SortableFields<TResource extends AnyResource> =
//   AttributeNamesWithFlag<TResource, 'sortable'>;

// /**
//  * Type for valid filter operators based on attribute type
//  */
// export type FilterOperators<TAttribute extends AnyAttribute> =
//   TAttribute['_type'] extends 'string'
//     ? StringFilterOperators
//     : TAttribute['_type'] extends 'number' | 'date'
//       ? ComparisonFilterOperators
//       : TAttribute['_type'] extends 'boolean'
//         ? BooleanFilterOperators
//         : TAttribute['_type'] extends 'array'
//           ? ArrayFilterOperators
//           : BasicFilterOperators;

// /**
//  * Basic filter operators available for all types
//  */
// export interface BasicFilterOperators {
//   eq?: unknown;
//   ne?: unknown;
//   in?: unknown[];
//   nin?: unknown[];
// }

// /**
//  * String-specific filter operators
//  */
// export interface StringFilterOperators extends BasicFilterOperators {
//   contains?: string;
//   startsWith?: string;
//   endsWith?: string;
//   regex?: string;
// }

// /**
//  * Comparison filter operators for numbers and dates
//  */
// export interface ComparisonFilterOperators extends BasicFilterOperators {
//   gt?: number | Date;
//   gte?: number | Date;
//   lt?: number | Date;
//   lte?: number | Date;
//   between?: [number | Date, number | Date];
// }

// /**
//  * Boolean filter operators
//  */
// export interface BooleanFilterOperators extends BasicFilterOperators {
//   // Only basic ops for booleans
// }

// /**
//  * Array filter operators
//  */
// export interface ArrayFilterOperators extends BasicFilterOperators {
//   includes?: unknown;
//   empty?: boolean;
// }

// /**
//  * Main query builder for a specific resource
//  */
// export class ResourceQueryBuilder<
//   TResourceMap extends ResourceMap,
//   TRelations extends AnyConnectedRelations<TResourceMap>,
//   TResourceName extends keyof TResourceMap
// > {
//   private readonly _resourceName: TResourceName;
//   private readonly _graph: RelationGraph<TResourceMap, TRelations>;
//   private readonly _params: QueryParams = {};

//   constructor(
//     resourceName: TResourceName,
//     graph: RelationGraph<TResourceMap, TRelations>
//   ) {
//     this._resourceName = resourceName;
//     this._graph = graph;
//   }

//   /**
//    * Specifies which fields to select from the resource
//    * @param fields - Array of field names to select, or '*' for all selectable fields
//    */
//   public select<
//     TFields extends SelectableFields<TResourceMap[TResourceName]> | '*'
//   >(fields: TFields extends '*' ? '*' : TFields): this {
//     // If '*' is provided, get all selectable fields
//     if (fields === '*') {
//       const resource = this._graph.getResource(this._resourceName);
//       const selectableFields = Object.entries(resource.attributes)
//         .filter(([_, attr]) => attr._flags.selectable)
//         .map(([name]) => name);

//       this._params.select = {
//         type: QueryParamType.Select,
//         fields: selectableFields
//       };
//     } else {
//       this._params.select = {
//         type: QueryParamType.Select,
//         fields: fields as string[]
//       };
//     }

//     return this;
//   }

//   /**
//    * Specifies filter criteria for the query
//    * @param criteria - Object containing field names and filter values/operators
//    */
//   public filter<
//     TFields extends FilterableFields<TResourceMap[TResourceName]>,
//     TFilter extends {
//       [K in TFields]?: FilterOperators<
//         TResourceMap[TResourceName]['attributes'][K]
//       >;
//     }
//   >(criteria: TFilter): this {
//     this._params.filter = {
//       type: QueryParamType.Filter,
//       criteria: criteria as Record<string, unknown>
//     };

//     return this;
//   }

//   /**
//    * Specifies sort order for the query
//    * @param fields - Object mapping field names to sort directions
//    */
//   public sort<TFields extends SortableFields<TResourceMap[TResourceName]>>(
//     fields: Partial<Record<TFields, SortDirection>>
//   ): this {
//     this._params.sort = {
//       type: QueryParamType.Sort,
//       fields: fields as Record<string, SortDirection>
//     };

//     return this;
//   }

//   /**
//    * Specifies pagination parameters for the query
//    * @param params - Pagination parameters (page, limit, or offset)
//    */
//   public paginate(params: {
//     page?: number;
//     limit?: number;
//     offset?: number;
//   }): this {
//     this._params.pagination = {
//       type: QueryParamType.Pagination,
//       ...params
//     };

//     return this;
//   }

//   /**
//    * Specifies which relations to populate and how
//    * @param relationBuilder - Function that builds relation queries
//    */
//   public populate<TPopulate extends Record<string, QueryParams>>(
//     relationBuilder: (
//       relations: RelationQueryBuilderMap<
//         TResourceMap,
//         TRelations,
//         TResourceName
//       >
//     ) => TPopulate
//   ): this {
//     // Create relation query builders for each relation of this resource
//     const relationBuilders = this.createRelationQueryBuilders();

//     // Call the builder function to get the relation queries
//     const relationQueries = relationBuilder(relationBuilders);

//     this._params.populate = {
//       type: QueryParamType.Populate,
//       relations: relationQueries
//     };

//     return this;
//   }

//   /**
//    * Creates a map of relation query builders for each relation of this resource
//    */
//   private createRelationQueryBuilders(): RelationQueryBuilderMap<
//     TResourceMap,
//     TRelations,
//     TResourceName
//   > {
//     const relations = this._graph.getRelationsFor(this._resourceName);
//     const builders: Record<
//       string,
//       RelationQueryBuilder<TResourceMap, TRelations, any>
//     > = {};

//     for (const [relationName, relation] of Object.entries(relations)) {
//       const targetResourceName = relation.target.name as keyof TResourceMap;
//       builders[relationName] = new RelationQueryBuilder(
//         relationName,
//         targetResourceName,
//         this._graph,
//         relation.cardinality
//       );
//     }

//     return builders as RelationQueryBuilderMap<
//       TResourceMap,
//       TRelations,
//       TResourceName
//     >;
//   }

//   /**
//    * Returns the constructed query parameters
//    */
//   public getParams(): QueryParams {
//     return this._params;
//   }

//   /**
//    * Executes the query (placeholder for actual implementation)
//    */
//   public async execute(): Promise<unknown> {
//     // This would be implemented based on your data fetching strategy
//     // For example, making an API call with the constructed parameters
//     const params = this.getParams();
//     console.log(
//       `Executing query for ${this._resourceName} with params:`,
//       params
//     );

//     // Placeholder return
//     return Promise.resolve({
//       data: [],
//       meta: {
//         total: 0,
//         pages: 0
//       }
//     });
//   }
// }

// /**
//  * Type for a map of relation query builders
//  */
// export type RelationQueryBuilderMap<
//   TResourceMap extends ResourceMap,
//   TRelations extends AnyConnectedRelations<TResourceMap>,
//   TResourceName extends keyof TResourceMap
// > = {
//   [K in keyof TRelations[TResourceName]['relations']]: RelationQueryBuilder<
//     TResourceMap,
//     TRelations,
//     GetResourceName<TRelations[TResourceName]['relations'][K]['target']>
//   >;
// };

// /**
//  * Query builder for relations (used within populate)
//  */
// export class RelationQueryBuilder<
//   TResourceMap extends ResourceMap,
//   TRelations extends AnyConnectedRelations<TResourceMap>,
//   TTargetResourceName extends keyof TResourceMap
// > {
//   private readonly _relationName: string;
//   private readonly _targetResourceName: TTargetResourceName;
//   private readonly _graph: RelationGraph<TResourceMap, TRelations>;
//   private readonly _cardinality: RelationCardinality;
//   private readonly _params: QueryParams = {};

//   constructor(
//     relationName: string,
//     targetResourceName: TTargetResourceName,
//     graph: RelationGraph<TResourceMap, TRelations>,
//     cardinality: RelationCardinality
//   ) {
//     this._relationName = relationName;
//     this._targetResourceName = targetResourceName;
//     this._graph = graph;
//     this._cardinality = cardinality;
//   }

//   /**
//    * Specifies which fields to select from the related resource
//    * @param fields - Array of field names to select, or '*' for all selectable fields
//    */
//   public select<
//     TFields extends SelectableFields<TResourceMap[TTargetResourceName]> | '*'
//   >(fields: TFields extends '*' ? '*' : TFields[]): this {
//     // If '*' is provided, get all selectable fields
//     if (fields === '*') {
//       const resource = this._graph.getResource(this._targetResourceName);
//       const selectableFields = Object.entries(resource.attributes)
//         .filter(([_, attr]) => attr._flags.selectable)
//         .map(([name]) => name);

//       this._params.select = {
//         type: QueryParamType.Select,
//         fields: selectableFields
//       };
//     } else {
//       this._params.select = {
//         type: QueryParamType.Select,
//         fields: fields as string[]
//       };
//     }

//     return this;
//   }

//   /**
//    * Specifies filter criteria for the related resource
//    * @param criteria - Object containing field names and filter values/operators
//    */
//   public filter<
//     TFields extends FilterableFields<TResourceMap[TTargetResourceName]>,
//     TFilter extends {
//       [K in TFields]?: FilterOperators<
//         TResourceMap[TTargetResourceName]['attributes'][K]
//       >;
//     }
//   >(criteria: TFilter): this {
//     this._params.filter = {
//       type: QueryParamType.Filter,
//       criteria: criteria as Record<string, unknown>
//     };

//     return this;
//   }

//   /**
//    * Specifies sort order for the related resource
//    * @param fields - Object mapping field names to sort directions
//    */
//   public sort<
//     TFields extends SortableFields<TResourceMap[TTargetResourceName]>
//   >(fields: Partial<Record<TFields, SortDirection>>): this {
//     this._params.sort = {
//       type: QueryParamType.Sort,
//       fields: fields as Record<string, SortDirection>
//     };

//     return this;
//   }

//   /**
//    * Specifies pagination parameters for the related resource
//    * (Only applicable for many-to-many relations)
//    * @param params - Pagination parameters (page, limit, or offset)
//    */
//   public paginate(params: {
//     page?: number;
//     limit?: number;
//     offset?: number;
//   }): this {
//     if (this._cardinality !== RelationCardinality.MANY) {
//       console.warn(
//         `Pagination applied to a non-MANY relation: ${this._relationName}. This may not have the expected effect.`
//       );
//     }

//     this._params.pagination = {
//       type: QueryParamType.Pagination,
//       ...params
//     };

//     return this;
//   }

//   /**
//    * Specifies which nested relations to populate and how
//    * @param relationBuilder - Function that builds nested relation queries
//    */
//   public populate<TPopulate extends Record<string, QueryParams>>(
//     relationBuilder: (
//       relations: RelationQueryBuilderMap<
//         TResourceMap,
//         TRelations,
//         TTargetResourceName
//       >
//     ) => TPopulate
//   ): this {
//     // Create relation query builders for the target resource
//     const relationBuilders = this.createNestedRelationQueryBuilders();

//     // Call the builder function to get the relation queries
//     const relationQueries = relationBuilder(relationBuilders);

//     this._params.populate = {
//       type: QueryParamType.Populate,
//       relations: relationQueries
//     };

//     return this;
//   }

//   /**
//    * Creates a map of relation query builders for the target resource
//    */
//   private createNestedRelationQueryBuilders(): RelationQueryBuilderMap<
//     TResourceMap,
//     TRelations,
//     TTargetResourceName
//   > {
//     const relations = this._graph.getRelationsFor(this._targetResourceName);
//     const builders: Record<
//       string,
//       RelationQueryBuilder<TResourceMap, TRelations, any>
//     > = {};

//     for (const [relationName, relation] of Object.entries(relations)) {
//       const targetResourceName = relation.target.name as keyof TResourceMap;
//       builders[relationName] = new RelationQueryBuilder(
//         relationName,
//         targetResourceName,
//         this._graph,
//         relation.cardinality
//       );
//     }

//     return builders as RelationQueryBuilderMap<
//       TResourceMap,
//       TRelations,
//       TTargetResourceName
//     >;
//   }

//   /**
//    * Returns the constructed query parameters
//    */
//   public getParams(): QueryParams {
//     return this._params;
//   }
// }

// /**
//  * Creates a query builder for a set of resources and their relationships
//  * @param resources - Resource map containing defined resources
//  * @param relationships - Function to define relationships between resources
//  * @returns A query factory for creating resource-specific queries
//  */
// export function createQuery<
//   TResourceMap extends ResourceMap,
//   TRelationshipMap extends ArrayRelationshipMap<TResourceMap>
// >(
//   resources: TResourceMap,
//   relationships: (
//     connector: RelationshipConnector<TResourceMap>
//   ) => TRelationshipMap
// ) {
//   // Create relation graph from resources and relationships
//   const graph = createRelationGraph(resources, relationships);

//   return {
//     /**
//      * Creates a query builder for a specific resource
//      * @param resourceName - Name of the resource to query
//      * @returns A ResourceQueryBuilder instance for the specified resource
//      */
//     for<TResourceName extends keyof TResourceMap>(
//       resourceName: TResourceName
//     ): ResourceQueryBuilder<
//       TResourceMap,
//       ConnectedRelations<TResourceMap, TRelationshipMap>,
//       TResourceName
//     > {
//       if (!resources[resourceName]) {
//         throw new Error(
//           `Resource "${String(resourceName)}" not found in resource map`
//         );
//       }

//       return new ResourceQueryBuilder(
//         resourceName,
//         graph as RelationGraph<
//           TResourceMap,
//           ConnectedRelations<TResourceMap, TRelationshipMap>
//         >
//       );
//     }
//   };
// }
