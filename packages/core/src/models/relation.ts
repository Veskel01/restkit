import { type KeyPath, createKeyPath } from '../utils/key-path';
import type { AnyResource, GetResourceName } from './resource';

/**
 * Represents cardinality of resource relations in REST API
 */
export enum RelationCardinality {
  ONE = 'one',
  MANY = 'many'
}

/**
 * Represents a path through a resource hierarchy, connecting a source resource to a target resource through a relation name.
 *
 * @template TFrom - The source resource or resource name
 * @template TName - The name of the relation
 */
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

/**
 * Represents a map of relations, where each key is a resource name and each value is an array of relations.
 */
export type RelationMap = Record<string, AnyRelation>;

/**
 * Represents a relation between a source resource and a target resource.
 *
 * @template TSource - The source resource
 * @template TTarget - The target resource
 * @template TName - The name of the relation
 * @template TCardinality - The cardinality of the relation
 */
export class Relation<
  TSource extends AnyResource,
  TTarget extends AnyResource,
  TName extends string,
  TCardinality extends RelationCardinality
> {
  public readonly name: TName;
  public readonly source: TSource;
  public readonly target: TTarget;
  public readonly cardinality: TCardinality;
  public readonly path: RelationPath<TSource, TName>;

  public constructor(
    source: TSource,
    target: TTarget,
    name: TName,
    cardinality: TCardinality
  ) {
    this.name = name;
    this.source = source;
    this.target = target;
    this.cardinality = cardinality;
    this.path = createKeyPath(source.name, name) as RelationPath<
      TSource,
      TName
    >;
  }
}
