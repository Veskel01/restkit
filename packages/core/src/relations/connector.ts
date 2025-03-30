import { RelationCardinality } from '../models/relation';
import type { ResourceMap } from '../models/resource';

/**
 * Represents a single connection between two resources.
 * Includes the name of the relation, the target resource key,
 * and the cardinality (one or many).
 *
 * @template TResourceMap - Map of all available resources
 * @template TTarget - Name of the target resource being connected to
 * @template TName - Name of the relation
 * @template TCardinality - The relation's cardinality (ONE or MANY)
 */
export interface RelationConnection<
  TResourceMap extends ResourceMap,
  TTarget extends keyof TResourceMap & string,
  TName extends string,
  TCardinality extends RelationCardinality
> {
  name: TName;
  target: TTarget;
  cardinality: TCardinality;
}

/**
 * A generic version of a relation connection with relaxed constraints.
 * Useful when working with dynamic or inferred connections.
 */
export type AnyRelationConnection = RelationConnection<
  ResourceMap,
  string,
  string,
  RelationCardinality
>;

/**
 * Allows naming a relation connection from a given resource to another.
 * This is the final step of defining a connection, using the `as(...)` method.
 *
 * Used within the fluent DSL of `RelationConnector.one.<resource>.as('name')`
 * or `RelationConnector.many.<resource>.as('name')`.
 *
 * @template TResourceMap - Resource map
 * @template TSource - Name of the target resource (which is the source of the relation)
 * @template TCardinality - ONE or MANY
 */
export interface RelationConnectionCreator<
  TResourceMap extends ResourceMap,
  TSource extends keyof TResourceMap & string,
  TCardinality extends RelationCardinality
> {
  /**
   * Assigns a name to the relation connection.
   *
   * @param name - The name of the relation
   * @returns A fully defined RelationConnection object
   */
  as: <TName extends string>(
    name: TName
  ) => RelationConnection<TResourceMap, TSource, TName, TCardinality>;
}

/**
 * Maps each resource to a `RelationConnectionCreator`, allowing fluent
 * relation building using `.one.<target>.as('name')` or `.many.<target>.as('name')`.
 *
 * @template TResourceMap - Resource map
 * @template TCardinality - ONE or MANY
 */
type ConnectionCreatorMap<
  TResourceMap extends ResourceMap,
  TCardinality extends RelationCardinality
> = {
  [K in keyof TResourceMap]: RelationConnectionCreator<
    TResourceMap,
    K & string,
    TCardinality
  >;
};

/**
 * A class that helps define relation connections between resources.
 * Provides a fluent API to specify one-to-one and one-to-many relationships.
 *
 * Used during creation of a `RelationGraph`, where the `RelationConnector`
 * acts as a helper for describing how resources are connected.
 *
 * @template TResourceMap - A map of all resource types to be connected
 *
 * @example
 * ```ts
 * const connections = (connector: RelationConnector<typeof resourceMap>) => ({
 *   user: [
 *     connector.one.profile.as('profile'),
 *     connector.many.posts.as('posts')
 *   ],
 *   post: [
 *     connector.one.user.as('author')
 *   ]
 * });
 * ```
 */
export class RelationConnector<TResourceMap extends ResourceMap> {
  readonly #resourceMap: TResourceMap;

  /**
   * Constructs a new RelationConnector using a provided resource map.
   *
   * @param resourceMap - The map of resources to build connections for
   */
  public constructor(resourceMap: TResourceMap) {
    this.#resourceMap = resourceMap;
  }

  /**
   * Starts building one-to-one relation connections.
   * Enables usage like: `connector.one.user.as('author')`.
   */
  public get one(): ConnectionCreatorMap<
    TResourceMap,
    RelationCardinality.ONE
  > {
    return this.buildConnectionMap((target) => ({
      as: (relationName) => ({
        name: relationName,
        target: target.name,
        cardinality: RelationCardinality.ONE
      })
    }));
  }

  /**
   * Starts building one-to-many relation connections.
   * Enables usage like: `connector.many.posts.as('posts')`.
   */
  public get many(): ConnectionCreatorMap<
    TResourceMap,
    RelationCardinality.MANY
  > {
    return this.buildConnectionMap((target) => ({
      as: (relationName) => ({
        name: relationName,
        target: target.name,
        cardinality: RelationCardinality.MANY
      })
    }));
  }

  /**
   * Internal method that builds a proxy-based map to allow fluent access
   * to all resources via `.one.<resource>` or `.many.<resource>`.
   *
   * @param handler - Function that builds a RelationConnectionCreator for a given resource
   * @returns A map where each key is a resource name and the value is a relation creator
   */
  private buildConnectionMap<
    TResourceKey extends keyof TResourceMap & string,
    TCardinality extends RelationCardinality
  >(
    handler: (
      resource: TResourceMap[TResourceKey]
    ) => RelationConnectionCreator<TResourceMap, TResourceKey, TCardinality>
  ): ConnectionCreatorMap<TResourceMap, TCardinality> {
    return new Proxy(
      {},
      {
        get: (_, prop) => {
          const resourceKey = prop as TResourceKey;

          const resource = this.#resourceMap[resourceKey];

          if (!resource) {
            throw new Error(
              `Resource "${resourceKey}" not found in resource map`
            );
          }

          return handler(resource);
        }
      }
    ) as ConnectionCreatorMap<TResourceMap, TCardinality>;
  }
}
