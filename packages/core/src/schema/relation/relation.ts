import { type Path, createPathFromSegments } from '../../utils';
import type { AnyResource, GetResourceName } from '../resource/resource';

/**
 * Describes the type of relationship between resources.
 * - `ONE`: The relation points to a single resource
 * - `MANY`: The relation points to multiple resources
 */
export enum RelationCardinality {
  ONE = 'one',
  MANY = 'many'
}

/**
 * Represents a key path between two resources using a relation name.
 * This is used to express a navigable path in resource hierarchies.
 *
 * @template TFrom - Source resource name or resource type
 * @template TName - Name of the relation
 *
 * @example
 * ```ts
 * type Path = RelationPath<'user', 'posts'>; // "user.posts"
 * ```
 */
export type RelationPath<
  TFrom extends AnyResource | string,
  TName extends string,
  TPathSeparator extends string
> = Path<
  [TFrom extends AnyResource ? GetResourceName<TFrom> : TFrom, TName],
  TPathSeparator
>;

/**
 * A type alias representing any possible relation instance.
 * Useful when working with untyped or dynamic relations.
 */
export type AnyRelation = Relation<
  AnyResource,
  AnyResource,
  string,
  RelationCardinality,
  string
>;

/**
 * A map of named relations for a given resource.
 * The keys represent relation names, and the values are `Relation` instances.
 */
export type RelationMap = Record<string, AnyRelation>;

export class Relation<
  TSource extends AnyResource,
  TTarget extends AnyResource,
  TName extends string,
  TCardinality extends RelationCardinality,
  TPathSeparator extends string
> {
  /** The name of the relation (e.g., "author", "posts") */
  public readonly name: TName;

  /** The source resource where the relation originates */
  public readonly from: TSource;

  /** The target resource where the relation points to */
  public readonly to: TTarget;

  /** The cardinality of the relation (one or many) */
  public readonly cardinality: TCardinality;

  /** The fully-qualified relation path, e.g. "user.posts" */
  public readonly path: RelationPath<TSource, TName, TPathSeparator>;

  public constructor(
    from: TSource,
    to: TTarget,
    name: TName,
    cardinality: TCardinality,
    pathSeparator: TPathSeparator
  ) {
    this.name = name;
    this.from = from;
    this.to = to;
    this.cardinality = cardinality;
    this.path = createPathFromSegments(
      [from.name, name],
      pathSeparator
    ) as RelationPath<TSource, TName, TPathSeparator>;
  }
}
