import {
  type AnyRelation,
  Relation,
  type RelationCardinality,
  type RelationMap,
  type RelationPath
} from '../models/relation';
import type {
  AnyResource,
  GetResourceName,
  InferResourceOutput,
  ResourceMap
} from '../models/resource';
import type {
  DecrementDepth,
  IsEmptyObject,
  RemoveNeverProperties
} from '../types/utility.type';
import {
  type CombinedResources,
  combineResources
} from '../utils/combine-resources';
import { KEY_PATH_SEPARATOR, createKeyPath } from '../utils/key-path';
import { type AnyRelationConnection, RelationConnector } from './connector';

/**
 * Represents a resource along with its defined relations.
 * This internal interface combines a resource with its relationship map.
 *
 * @template R - The resource type
 * @template TRelations - Map of relation names to relation instances
 * @internal
 */
interface ResourceWithRelations<
  R extends AnyResource,
  TRelations extends RelationMap
> {
  /** The resource definition */
  resource: R;

  /** Map of named relations from this resource to other resources */
  relations: TRelations;
}

/**
 * Maps resource names to arrays of relation connections.
 * This structure is used to define how resources are connected to each other.
 *
 * @template TResourceMap - Map of resource names to resource definitions
 */
type RelationConnectionMap<TResourceMap extends ResourceMap> = {
  [K in keyof TResourceMap]?: AnyRelationConnection[];
};

/**
 * Maps resources to their connections based on a relation connection map.
 * This type transforms the connection map into actual relation instances.
 *
 * @template TResourceMap - Map of resource names to resource definitions
 * @template TConnections - Map of resource names to arrays of relation connections
 */
export type ConnectedRelations<
  TResourceMap extends ResourceMap,
  TConnections extends RelationConnectionMap<TResourceMap>
> = {
  [K in keyof TResourceMap]: ResourceWithRelations<
    TResourceMap[K],
    K extends keyof TConnections
      ? TConnections[K] extends AnyRelationConnection[]
        ? {
            [RelName in TConnections[K][number]['name']]: Extract<
              TConnections[K][number],
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
 * A generic type for any connected relations structure.
 * Used for flexibility when the exact relation map type is not important.
 *
 * @template TResourceMap - Map of resource names to resource definitions
 */
export type AnyConnectedRelations<
  TResourceMap extends ResourceMap = ResourceMap
> = ConnectedRelations<
  TResourceMap,
  // biome-ignore lint/suspicious/noExplicitAny: Required for proper type matching
  RelationConnectionMap<TResourceMap> & any
>;

/**
 * Infers the complete resource type with its nested relations up to a specified depth.
 * This type recursively builds a structure that includes both the resource's own properties
 * and its related resources, handling different relationship types and cardinalities.
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
        [K in keyof TRelationsResult[TResourceName]['relations']]: `${RelationPath<TResourceName & string, K & string>}` extends TVisitedPaths
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
                    | `${RelationPath<TResourceName & string, TRelName>}`
                  > | null
                : InferResourceWithRelations<
                    TRelationsResult,
                    GetResourceName<TTo> & keyof TRelationsResult,
                    DecrementDepth<TDepth>,
                    | TVisitedPaths
                    | `${RelationPath<TResourceName & string, TRelName>}`
                  >[]
              : C extends RelationCardinality.ONE
                ? InferResourceOutput<TTo> | null
                : InferResourceOutput<TTo>[]
            : never;
      }
    >;

/**
 * Helper type to check if a resource has relations.
 *
 * @template TResourceName - Name of the resource to check
 * @template TRelations - Connected relations structure
 */
type HasRelations<
  TResourceName extends keyof TRelationDefinitions,
  TRelationDefinitions extends ConnectedRelations<
    ResourceMap,
    RelationConnectionMap<ResourceMap>
  >
> = IsEmptyObject<TRelationDefinitions[TResourceName]['relations']> extends true
  ? false
  : true;

/**
 * Gets all possible relation paths from a specific resource.
 * Returns never if the resource has no relations.
 *
 * @template TRelations - Connected relations structure
 * @template TResourceName - Name of the resource to get paths from
 * @template TDepth - Maximum depth of relation paths (default: 4)
 */
export type ResourceRelationPaths<
  TRelations extends AnyConnectedRelations,
  TResourceName extends keyof TRelations,
  TDepth extends number = 4
> = HasRelations<TResourceName, TRelations> extends false
  ? never
  : TDepth extends 0
    ? never
    : {
        // Direct relations from this resource
        [RelName in keyof TRelations[TResourceName]['relations']]: TRelations[TResourceName]['relations'][RelName] extends Relation<
          AnyResource,
          infer TTo,
          string,
          RelationCardinality
        >
          ?
              | (RelName & string)
              // Nested paths
              | (GetResourceName<TTo> extends keyof TRelations
                  ? HasRelations<
                      GetResourceName<TTo> & keyof TRelations,
                      TRelations
                    > extends true
                    ? `${RelName & string}${typeof KEY_PATH_SEPARATOR}${ResourceRelationPaths<
                        TRelations,
                        GetResourceName<TTo> & keyof TRelations,
                        DecrementDepth<TDepth>
                      > &
                        string}`
                    : RelName & string
                  : RelName & string)
          : never;
      }[keyof TRelations[TResourceName]['relations']];

/**
 * Represents a directed graph structure where nodes are resources
 * and edges are relations between them. This is the core structure used for
 * querying and navigating structured resource relationships.
 *
 * @template TResourceMap - Map of resource names to resource definitions
 * @template TRelations - Connected relations structure
 */
export class RelationGraph<
  TResourceMap extends ResourceMap,
  TRelations extends AnyConnectedRelations<TResourceMap>
> {
  /** Complete mapping of each resource to its relations */
  public readonly relations: Readonly<TRelations>;

  /** Internal graph representation using adjacency list (outgoing edges) */
  private readonly adjacencyList: Map<string, Set<string>>;

  private constructor(
    resourceMap: TResourceMap,
    connections: RelationConnectionMap<TResourceMap>
  ) {
    const { relations, adjacencyList } = this.createGraphData(
      resourceMap,
      connections
    );
    this.relations = relations;
    this.adjacencyList = adjacencyList;
  }

  /**
   * Creates a new instance of the RelationGraph from a resource map
   * and a function that defines connections using a RelationConnector.
   *
   * @param resourceMap - Map of resource names to resource definitions
   * @param createConnections - Function that uses a RelationConnector to define connections
   * @returns A new RelationGraph instance with the defined connections
   */
  public static create<
    TResourceMap extends ResourceMap,
    TConnections extends RelationConnectionMap<TResourceMap>
  >(
    resourceMap: TResourceMap,
    createConnections: (
      connector: RelationConnector<TResourceMap>
    ) => TConnections
  ): RelationGraph<
    TResourceMap,
    ConnectedRelations<TResourceMap, TConnections>
  > {
    const connector = new RelationConnector(resourceMap);
    const connections = createConnections(connector);

    return new RelationGraph(resourceMap, connections);
  }

  /**
   * Retrieves a resource instance by its name.
   *
   * @param name - The name of the resource to retrieve
   * @returns The resource instance
   */
  public getResource<K extends keyof TResourceMap>(name: K): TResourceMap[K] {
    return this.relations[name].resource as TResourceMap[K];
  }

  /**
   * Returns all resources as a flat map without relation metadata.
   *
   * @returns A map of resource names to their instances
   */
  public getResources(): TResourceMap {
    const resources: Record<string, AnyResource> = {};

    for (const [resourceName, resourceWithRelations] of Object.entries(
      this.relations
    )) {
      resources[resourceName] = resourceWithRelations.resource;
    }

    return resources as TResourceMap;
  }

  /**
   * Gets all relations for a given resource.
   *
   * @param resourceName - The name of the resource to get relations for
   * @returns The relations for the given resource
   */
  public getRelationsFor<K extends keyof TResourceMap>(
    resourceName: K
  ): TRelations[K]['relations'] {
    return this.relations[resourceName].relations;
  }

  /**
   * Gets a specific named relation from a given resource.
   *
   * @param resourceName - The name of the resource to get the relation from
   * @param relationName - The name of the relation to get
   * @returns The relation object if found, undefined otherwise
   */
  public getRelation<
    K extends keyof TResourceMap,
    RelName extends keyof TRelations[K]['relations']
  >(
    resourceName: K,
    relationName: RelName
  ): TRelations[K]['relations'][RelName] | undefined {
    const relations = this.getRelationsFor(resourceName);
    return relations[relationName];
  }

  /**
   * Gets resource info with relation counts for incoming and outgoing connections.
   *
   * @returns Record mapping resource names to their relation counts
   */
  public getResourcesWithRelationCounts(): Record<
    keyof TResourceMap,
    {
      incoming: number;
      outgoing: number;
    }
  > {
    const result: Record<string, { incoming: number; outgoing: number }> = {};

    for (const resourceName of Object.keys(this.relations)) {
      const outgoing = Object.keys(
        this.relations[resourceName as keyof TResourceMap].relations
      ).length;
      const incoming = [...this.adjacencyList.entries()].filter(
        ([_, targets]) => targets.has(resourceName)
      ).length;

      result[resourceName] = { incoming, outgoing };
    }

    return result as Record<
      keyof TResourceMap,
      { incoming: number; outgoing: number }
    >;
  }

  /**
   * Gets all valid relation paths from a specific resource.
   * For 'OWNS' relationships, traverses the full path hierarchy.
   * For 'BELONGS_TO' relationships, only includes direct relations without further traversal.
   *
   * @param resourceName - The name of the resource to get relation paths for
   * @param maxDepth - The maximum depth of relation paths to retrieve
   * @returns An array of valid relation paths
   */
  public getRelationPaths<
    K extends keyof TResourceMap,
    TDepth extends number = 4
  >(
    resourceName: K,
    maxDepth: TDepth = 4 as TDepth
  ): ResourceRelationPaths<TRelations, K, TDepth>[] {
    const paths: string[] = [];

    // Get all relations for this resource
    const relations = this.getRelationsFor(resourceName);

    // First pass: collect direct relation names
    for (const [relationName, relation] of Object.entries(relations)) {
      const typedRelation = relation as AnyRelation;
      paths.push(relationName);

      this.collectRelationPaths(
        typedRelation.target.name as K,
        relationName,
        paths,
        maxDepth - 1,
        new Set([resourceName as string])
      );
    }

    return paths as ResourceRelationPaths<TRelations, K, TDepth>[];
  }

  /**
   * Finds the shortest path (by number of relations) between two resources
   * using Breadth-First Search (BFS).
   *
   * @param fromResource - The starting resource name
   * @param toResource - The target resource name
   * @returns An array of resource names representing the shortest path, or null if no path exists
   */
  public findShortestPath<
    K1 extends keyof TResourceMap,
    K2 extends keyof TResourceMap
  >(fromResource: K1, toResource: K2): Array<keyof TResourceMap> | null {
    if ((fromResource as string) === toResource) {
      return [fromResource];
    }

    // Initialize BFS
    const queue: Array<{
      resourceName: keyof TResourceMap;
      path: Array<keyof TResourceMap>;
    }> = [{ resourceName: fromResource, path: [fromResource] }];

    const visited = new Set<keyof TResourceMap>([fromResource]);

    // BFS loop
    while (queue.length > 0) {
      const current = queue.shift();
      if (!current) {
        return null;
      }

      const { resourceName, path } = current;
      const adjacentResources = this.getAdjacentResources(resourceName);

      for (const nextResource of adjacentResources) {
        // If we found the target, return the path
        if (nextResource === toResource) {
          return [...path, nextResource];
        }

        // Otherwise, add to queue if not visited
        if (!visited.has(nextResource)) {
          visited.add(nextResource);
          queue.push({
            resourceName: nextResource,
            path: [...path, nextResource]
          });
        }
      }
    }

    return null; // No path found
  }

  /**
   * Checks if a given path is a valid relation path for a resource.
   *
   * @param resourceName - The name of the resource to check the path against
   * @param path - The path to check
   * @returns True if the path is valid, false otherwise
   */
  public isValidRelationPath<K extends keyof TResourceMap>(
    resourceName: K,
    path: string
  ): boolean {
    if (!path) {
      return false;
    }

    const segments = path.split(KEY_PATH_SEPARATOR);
    let currentResource: keyof TResourceMap = resourceName;

    for (const segment of segments) {
      const relations = this.getRelationsFor(currentResource);

      if (!relations[segment]) {
        return false;
      }

      currentResource = (relations[segment] as AnyRelation).target
        .name as keyof TResourceMap;
    }

    return true;
  }

  /**
   * Helper method to collect nested relation paths.
   * This is separated from the main method to clarify that it's only used for OWNS relationships.
   *
   * @private
   */
  private collectRelationPaths<K extends keyof TResourceMap>(
    resourceName: K,
    currentPath: string,
    result: string[],
    remainingDepth: number,
    visited: Set<string>
  ): void {
    if (remainingDepth <= 0 || visited.has(resourceName as string)) {
      return;
    }

    visited.add(resourceName as string);
    const relations = this.getRelationsFor(resourceName);

    for (const [relationName, relation] of Object.entries(relations)) {
      const typedRelation = relation as AnyRelation;
      const newPath = createKeyPath(currentPath, relationName);

      result.push(newPath);

      this.collectRelationPaths(
        typedRelation.target.name as K,
        newPath,
        result,
        remainingDepth - 1,
        new Set(visited)
      );
    }
  }

  /**
   * Returns a list of all directly connected (outgoing) resources from a given resource.
   *
   * @private
   * @param resourceName - The name of the resource to get adjacent resources for
   * @returns Array of resource names that are directly connected
   */
  private getAdjacentResources<K extends keyof TResourceMap>(
    resourceName: K
  ): Array<keyof TResourceMap> {
    return Array.from(
      this.adjacencyList.get(resourceName as string) || []
    ) as Array<keyof TResourceMap>;
  }

  /**
   * Builds internal graph data from the resource and relation reference maps.
   * Generates relation objects and an adjacency list for traversal.
   *
   * @private
   * @param resourceMap - Map of resource names to resource definitions
   * @param referenceMap - Map of resource names to relation references
   * @returns Object containing relations and adjacency list
   */
  private createGraphData(
    resourceMap: ResourceMap,
    connections: RelationConnectionMap<ResourceMap>
  ): {
    relations: TRelations;
    adjacencyList: Map<string, Set<string>>;
  } {
    const relations: Record<
      string,
      ResourceWithRelations<AnyResource, Record<string, AnyRelation>>
    > = {};

    const adjacencyList = new Map<string, Set<string>>();

    for (const resourceName of Object.keys(resourceMap)) {
      adjacencyList.set(resourceName, new Set<string>());
    }

    for (const [sourceResourceName, sourceResource] of Object.entries(
      resourceMap
    )) {
      const resourceConnectionsArray = connections[sourceResourceName] || [];
      const processedRelations: RelationMap = {};

      for (const relationConnection of resourceConnectionsArray) {
        const { name: relationName, target, cardinality } = relationConnection;

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
        adjacencyList.get(sourceResourceName)?.add(target);
      }

      relations[sourceResourceName] = {
        resource: sourceResource,
        relations: processedRelations
      };
    }

    return {
      relations: relations as TRelations,
      adjacencyList
    };
  }
}

/**
 * Factory function to create a RelationGraph from either:
 * - An array of resources (automatically combined into a map)
 * - A pre-defined resource map
 *
 * This is the primary entry point for building relation graphs between resources.
 *
 * @param resources - Resource array or map
 * @param createConnections - Function that uses a RelationConnector to define connections
 * @returns A new RelationGraph instance with the defined connections
 *
 * @example
 * ```ts
 * const graph = createRelationGraph(resources, (connector) => ({
 *   user: [
 *     connector.one.profile.as('profile'),
 *     connector.many.posts.as('posts')
 *   ],
 *   post: [
 *     connector.one.user.as('author')
 *   ]
 * }));
 * ```
 */
export function createRelationGraph<
  TResources extends AnyResource[] | ResourceMap,
  TConnections extends RelationConnectionMap<TResourceMap>,
  TResourceMap extends TResources extends AnyResource[]
    ? CombinedResources<TResources>
    : TResources
>(
  resources: TResources,
  createConnections: (
    connector: RelationConnector<TResourceMap>
  ) => TConnections
): RelationGraph<TResourceMap, ConnectedRelations<TResourceMap, TConnections>> {
  if (Array.isArray(resources)) {
    return RelationGraph.create(
      combineResources(...resources),
      createConnections
    );
  }

  return RelationGraph.create(
    resources as unknown as TResourceMap,
    createConnections
  );
}
