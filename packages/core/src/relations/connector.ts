import { RelationCardinality, type Relationship } from '../models/relation';
import type { ResourceMap } from '../models/resource';

// TODO - add support for relationship options

/**
 * Represents a relationship connection between two resources.
 *
 */
export class RelationshipConnection<
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
   * Finalizes the relationship by assigning it a name.
   *
   * @param name - The name of the relationship.
   * @returns A fully defined Relationship object.
   */
  public as<TRelName extends string>(
    name: TRelName
  ): Relationship<TResourceMap, TTarget, TRelName, TCardinality> {
    return {
      target: this.target,
      name,
      cardinality: this.cardinality
    };
  }
}

/**
 * Provides a fluent API to define one-to-one and one-to-many relationships
 * between resources using a resource map.
 *
 * Relationships are created in two steps:
 * 1. Call `.one()` or `.many()` to specify the target and cardinality.
 * 2. Call `.as(name)` on the resulting descriptor to assign a name.
 */
export class RelationshipConnector<TResourceMap extends ResourceMap> {
  private readonly resourceMap: TResourceMap;

  public constructor(resourceMap: TResourceMap) {
    this.resourceMap = resourceMap;
  }

  /**
   * Defines a one-to-one relationship with the given target resource.
   *
   * @param target - The key of the target resource in the resource map.
   * @returns A relationship descriptor to be finalized with `.as(name)`.
   * @throws If the target resource does not exist in the resource map.
   */
  public one<TTarget extends keyof TResourceMap & string>(
    target: TTarget
  ): RelationshipConnection<TResourceMap, TTarget, RelationCardinality.ONE> {
    if (!this.resourceMap[target]) {
      throw new Error(`Resource "${target}" not found in resource map`);
    }

    return new RelationshipConnection(target, RelationCardinality.ONE);
  }

  /**
   * Defines a one-to-many relationship with the given target resource.
   *
   * @param target - The key of the target resource in the resource map.
   * @returns A relationship descriptor to be finalized with `.as(name)`.
   * @throws If the target resource does not exist in the resource map.
   */
  public many<TTarget extends keyof TResourceMap & string>(
    target: TTarget
  ): RelationshipConnection<TResourceMap, TTarget, RelationCardinality.MANY> {
    if (!this.resourceMap[target]) {
      throw new Error(`Resource "${target}" not found in resource map`);
    }

    return new RelationshipConnection(target, RelationCardinality.MANY);
  }
}
