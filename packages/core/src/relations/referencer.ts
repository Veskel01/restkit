import { RelationCardinality } from '../models/relation';
import type { ResourceMap } from '../models/resource';

/**
 * Represents a reference to a relation between a source resource and a target resource.
 * This is the core data structure that defines how resources are related to each other.
 *
 * @template TResourceMap - Map of all available resources
 * @template TTarget - The target resource identifier within the resource map
 * @template TName - The name of the relation, used to identify and access it
 * @template TCardinality - Defines if this is a one-to-one or one-to-many relationship
 */
export interface RelationReference<
  TResourceMap extends ResourceMap,
  TTarget extends keyof TResourceMap & string,
  TName extends string,
  TCardinality extends RelationCardinality
> {
  /** Unique name of the relation, used to identify it in queries and operations */
  name: TName;

  /** Identifier of the target resource in the resource map */
  target: TTarget;

  /** Defines whether this relation connects to a single resource or multiple resources */
  cardinality: TCardinality;
}

/**
 * Type representing any relation reference, useful for generic operations.
 */
export type AnyRelationReference = RelationReference<
  ResourceMap,
  string,
  string,
  RelationCardinality
>;

/**
 * Type representing a map of relation references for each resource, with a specific cardinality.
 * This is used internally by the RelationReferencer to provide type-safe access to relations.
 *
 * @template TResourceMap - Map of all available resources
 * @template TCardinality - The cardinality (ONE or MANY) of the relations in this map
 */
type RelationReferenceAccessorMap<
  TResourceMap extends ResourceMap,
  TCardinality extends RelationCardinality
> = {
  [K in keyof TResourceMap]: RelationAccessor<
    TResourceMap,
    K & string,
    TCardinality
  >;
};

/**
 * Provides access to create references for a specific relation.
 * This class is used to access and define relations between resources,
 * allowing you to specify the name of the relation with the `as` method.
 *
 * @template TResourceMap - Map of all available resources
 * @template TTarget - The target resource identifier within the resource map
 * @template TCardinality - Defines if this is a one-to-one or one-to-many relationship
 */
export class RelationAccessor<
  TResourceMap extends ResourceMap,
  TTarget extends keyof TResourceMap & string,
  TCardinality extends RelationCardinality
> {
  private readonly target: TTarget;
  private readonly cardinality: TCardinality;

  public constructor(target: TTarget, cardinality: TCardinality) {
    this.target = target;
    this.cardinality = cardinality;
  }

  /**
   * Finalizes the relation by assigning a name to it.
   * This method completes the relation definition by creating a RelationReference
   * that identifies the connection between resources.
   *
   * @param name - The name to assign to this relation
   * @returns A complete RelationReference object defining the relation
   *
   * @example
   * ```typescript
   * // Create a reference to a one-to-one relation named 'profile'
   * const profileRef = accessor.as('profile');
   * ```
   */
  public as<TRelName extends string>(
    name: TRelName
  ): RelationReference<TResourceMap, TTarget, TRelName, TCardinality> {
    return {
      name,
      target: this.target,
      cardinality: this.cardinality
    };
  }
}

/**
 * Provides a fluent API for referencing relations between resources.
 * This class is used to create both one-to-one and one-to-many relation references
 * in a type-safe manner, ensuring that only valid resources can be related.
 *
 * It serves as the entry point for defining the relationship structure in your application.
 *
 * @example
 * ```typescript
 * const relations = (referencer: RelationReferencer<MyResources>) => ({
 *   user: [
 *     referencer.one.profile.as('profile'),
 *     referencer.many.posts.as('posts')
 *   ]
 * });
 * ```
 *
 * @template TResourceMap - Map of all available resources
 */
export class RelationReferencer<TResourceMap extends ResourceMap> {
  readonly #resourceMap: TResourceMap;

  public constructor(resourceMap: TResourceMap) {
    this.#resourceMap = resourceMap;
  }

  /**
   * Creates one-to-one relation references between resources.
   * This property provides a proxy that allows you to access any resource
   * in the resource map and create a one-to-one relation to it.
   *
   * @example
   * ```typescript
   * // Create a one-to-one relation from user to profile
   * const userToProfile = referencer.one.profile.as('profile');
   * ```
   */
  public get one(): RelationReferenceAccessorMap<
    TResourceMap,
    RelationCardinality.ONE
  > {
    return this.createAccessorProxy(RelationCardinality.ONE);
  }

  /**
   * Creates one-to-many relation references between resources.
   * This property provides a proxy that allows you to access any resource
   * in the resource map and create a one-to-many relation to it.
   *
   * @example
   * ```typescript
   * // Create a one-to-many relation from user to posts
   * const userToPosts = referencer.many.posts.as('posts');
   * ```
   */
  public get many(): RelationReferenceAccessorMap<
    TResourceMap,
    RelationCardinality.MANY
  > {
    return this.createAccessorProxy(RelationCardinality.MANY);
  }

  /**
   * Creates a proxy that dynamically provides access to resources in the resource map.
   * This method is used internally to implement the `one` and `many` properties.
   *
   * @private
   * @param cardinality - The cardinality to use for the created relations
   * @returns A proxy object that provides access to resource relations
   */
  private createAccessorProxy<TCardinality extends RelationCardinality>(
    cardinality: TCardinality
  ): RelationReferenceAccessorMap<TResourceMap, TCardinality> {
    return new Proxy(
      {},
      {
        get: (_, prop) => {
          const key = prop as keyof TResourceMap & string;

          if (!this.#resourceMap[key]) {
            throw new Error(`Resource "${key}" not found in resource map`);
          }

          return new RelationAccessor(key, cardinality);
        }
      }
    ) as RelationReferenceAccessorMap<TResourceMap, TCardinality>;
  }
}
