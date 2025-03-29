import { type KeyPath, createKeyPath } from '../utils/key-path';
import type { AnyResource, GetResourceName, ResourceMap } from './resource';

/**
 * Represents cardinality of resource relations in REST API
 */
export enum RelationCardinality {
  ONE = 'one',
  MANY = 'many'
}

export type RelationPath<
  TFrom extends AnyResource | string,
  TName extends string
> = KeyPath<
  [TFrom extends AnyResource ? GetResourceName<TFrom> : TFrom, TName]
>;

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
  TSource extends AnyResource,
  TTarget extends AnyResource,
  TName extends string,
  TCardinality extends RelationCardinality
> {
  public readonly source: TSource;
  public readonly target: TTarget;
  public readonly name: TName;
  public readonly cardinality: TCardinality;
  public readonly path: RelationPath<TSource, TName>;

  public constructor(
    source: TSource,
    target: TTarget,
    name: TName,
    cardinality: TCardinality
  ) {
    this.source = source;
    this.target = target;
    this.name = name;
    this.cardinality = cardinality;
    this.path = createKeyPath(source.name, name) as RelationPath<
      TSource,
      TName
    >;
  }
}
