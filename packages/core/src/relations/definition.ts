import {
  type AnyRelation,
  type AnyRelationship,
  Relation,
  type RelationCardinality,
  type RelationKey,
  type RelationMap
} from '../models/relation';
import type {
  AnyResource,
  GetResourceName,
  InferResourceOutput,
  ResourceMap
} from '../models/resource';
import type {
  DecrementDepth,
  RemoveNeverProperties
} from '../types/utility.type';
import { ResourceLinker } from './linker';

interface ResourceWithRelations<
  R extends AnyResource,
  TRelations extends RelationMap
> {
  resource: R;
  relations: TRelations;
}

export type ArrayRelationshipMap<TResourceMap extends ResourceMap> = {
  [K in keyof TResourceMap]?: AnyRelationship[];
};

export type DefinedRelations<
  TResourceMap extends ResourceMap,
  TRelationshipMap extends ArrayRelationshipMap<TResourceMap>
> = {
  [K in keyof TResourceMap]: ResourceWithRelations<
    TResourceMap[K],
    K extends keyof TRelationshipMap
      ? TRelationshipMap[K] extends AnyRelationship[]
        ? {
            [RelName in TRelationshipMap[K][number]['name']]: Extract<
              TRelationshipMap[K][number],
              { name: RelName }
            > extends {
              target: infer TTarget;
              cardinality: infer C;
            }
              ? TTarget extends keyof TResourceMap
                ? C extends RelationCardinality
                  ? Relation<
                      TResourceMap[K],
                      TResourceMap[TTarget],
                      RelName & string,
                      C
                    >
                  : never
                : never
              : never;
          }
        : Record<string, never>
      : Record<string, never>
  >;
};

/**
 * Infers the complete resource type with its nested relations up to a specified depth.
 * This type recursively builds a structure that includes both the resource's own properties
 * and its related resources, handling both one-to-one and one-to-many relationships.
 * It also prevents circular references by tracking visited resource paths.
 *
 * @template TRelationsResult - Record mapping resource names to their definitions with relations
 * @template TResourceName - Name of the resource to infer relations for
 * @template TDepth - Maximum depth of relation nesting (default: 3)
 * @template TVisitedPaths - Union of paths already visited to prevent circular references
 */
export type InferResourceWithRelations<
  TRelationsResult extends Record<
    string,
    ResourceWithRelations<AnyResource, Record<string, AnyRelation>>
  >,
  TResourceName extends keyof TRelationsResult,
  TDepth extends number = 3,
  TVisitedPaths extends string = never
> = TDepth extends 0
  ? InferResourceOutput<TRelationsResult[TResourceName]['resource']>
  : RemoveNeverProperties<
      InferResourceOutput<TRelationsResult[TResourceName]['resource']> & {
        [K in keyof TRelationsResult[TResourceName]['relations']]: `${RelationKey<TResourceName & string, K & string>}` extends TVisitedPaths
          ? never
          : TRelationsResult[TResourceName]['relations'][K] extends Relation<
                AnyResource,
                infer TTo,
                infer TRelName,
                infer C
              >
            ? GetResourceName<TTo> extends keyof TRelationsResult
              ? C extends RelationCardinality.ONE
                ? InferResourceWithRelations<
                    TRelationsResult,
                    GetResourceName<TTo> & keyof TRelationsResult,
                    DecrementDepth<TDepth>,
                    | TVisitedPaths
                    | `${RelationKey<TResourceName & string, TRelName>}`
                  > | null
                : InferResourceWithRelations<
                    TRelationsResult,
                    GetResourceName<TTo> & keyof TRelationsResult,
                    DecrementDepth<TDepth>,
                    | TVisitedPaths
                    | `${RelationKey<TResourceName & string, TRelName>}`
                  >[]
              : C extends RelationCardinality.ONE
                ? InferResourceOutput<TTo> | null
                : InferResourceOutput<TTo>[]
            : never;
      }
    >;

/**
 * Defines relationships between resources in a type-safe manner.
 * This function processes resource relationships and creates a strongly-typed relation graph.
 *
 * @template TResourceMap - Map of resource names to their definitions
 * @template TRelationshipMap - Map of relationships between resources as arrays
 *
 * @param resourceMap - Object mapping resource names to their resource instances
 * @param createRelationships - Callback function that uses ResourceRelationManager to define relationships
 * @returns Processed relations with complete type information and runtime validation
 *
 * @example
 * ```typescript
 * const resources = {
 *   user: resource('user', {
 *     name: attr.string(),
 *     email: attr.string()
 *   }),
 *   post: resource('post', {
 *     title: attr.string(),
 *     content: attr.string()
 *   })
 * };
 *
 * const relations = defineRelations(resources, (r) => ({
 *   user: [r.many('post').as('posts')],
 *   post: [r.one('user').as('author')]
 * }));
 * ```
 *
 * @throws {Error} When a referenced target resource is not found in the resource map
 */
export function defineRelations<
  TResourceMap extends ResourceMap,
  TRelationshipMap extends ArrayRelationshipMap<TResourceMap>
>(
  resourceMap: TResourceMap,
  createRelationships: (
    linker: ResourceLinker<TResourceMap>
  ) => TRelationshipMap
): DefinedRelations<TResourceMap, TRelationshipMap> {
  const linker = new ResourceLinker(resourceMap);

  const relationships = createRelationships(linker);

  const result: Record<
    string,
    ResourceWithRelations<AnyResource, Record<string, AnyRelation>>
  > = {};

  for (const [sourceResourceName, sourceResource] of Object.entries(
    resourceMap
  )) {
    const resourceRelationsArray = relationships[sourceResourceName] || [];
    const processedRelations: RelationMap = {};

    for (const relationDef of resourceRelationsArray) {
      const { name: relationName, target, cardinality } = relationDef;

      if (!relationName) {
        throw new Error(
          `Relation name must be specified using the as() method for resource ${sourceResourceName}`
        );
      }

      const targetResource = resourceMap[target];

      if (!targetResource) {
        throw new Error(`Resource ${target} not found in resource map`);
      }

      const relation = new Relation(
        sourceResource,
        targetResource,
        relationName,
        cardinality
      );

      processedRelations[relationName] = relation;
    }

    result[sourceResourceName] = {
      resource: sourceResource,
      relations: processedRelations
    };
  }

  return result as DefinedRelations<TResourceMap, TRelationshipMap>;
}
