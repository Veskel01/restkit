import { PATH_SEPARATOR } from '../constants';
import type { AnyResource, GetResourceName, ResourceMap } from './resource';

/**
 * Represents cardinality of resource relations in REST API
 */
export enum RelationCardinality {
  ONE = 'one',
  MANY = 'many'
}

export type RelationKey<
  TFrom extends AnyResource | string,
  TName extends string
> = `${TFrom extends AnyResource ? GetResourceName<TFrom> : TFrom}${typeof PATH_SEPARATOR}${TName}`;

export type AnyRelation = Relation<
  AnyResource,
  AnyResource,
  string,
  RelationCardinality
>;

export interface Relationship<
  TResourceMap extends ResourceMap,
  TTarget extends keyof TResourceMap,
  TName extends string,
  C extends RelationCardinality
> {
  target: TTarget;
  name: TName;
  cardinality: C;
}

export type AnyRelationship = Relationship<
  ResourceMap,
  string,
  string,
  RelationCardinality
>;

export type RelationshipMap<TResourceMap extends ResourceMap> = {
  [K in keyof TResourceMap]?: Record<string, AnyRelationship>;
};

export type RelationMap = Record<string, AnyRelation>;

export class Relation<
  TFrom extends AnyResource,
  TTo extends AnyResource,
  TName extends string,
  TCardinality extends RelationCardinality
> {
  /**
   * Source resource
   */
  public readonly from: TFrom;

  /**
   * Target resource
   */
  public readonly to: TTo;

  /**
   * Relation name
   */
  public readonly name: TName;

  /**
   * Relation cardinality
   */
  public readonly cardinality: TCardinality;

  /**
   * Relation key (used for references)
   */
  public readonly key: RelationKey<TFrom, TName>;

  public constructor(
    from: TFrom,
    to: TTo,
    name: TName,
    cardinality: TCardinality
  ) {
    this.from = from;
    this.to = to;
    this.name = name;
    this.cardinality = cardinality;
    this.key = Relation.createKey(from, name);
  }

  public static createKey<TFrom extends AnyResource, TName extends string>(
    from: TFrom,
    name: TName
  ): RelationKey<TFrom, TName> {
    return `${from.name}${PATH_SEPARATOR}${name}` as RelationKey<TFrom, TName>;
  }
}
