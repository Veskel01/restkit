import { type Path, createPathFromSegments } from '../utils/path';
import type { AnyResource, GetResourceName } from './resource';

/**
 * Describes the type of relationship between resources.
 * - `ONE`: The relation points to a single resource
 * - `MANY`: The relation points to multiple resources
 *
 * Used to define whether a relation is one-to-one or one-to-many.
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
  TSeparator extends string
> = Path<
  [TFrom extends AnyResource ? GetResourceName<TFrom> : TFrom, TName],
  TSeparator
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

/**
 * Represents a relation between two resources.
 * Includes metadata like relation name, target resource, and cardinality.
 *
 * This class is used internally to describe relationships and relation paths
 * between resources in a `RelationGraph`.
 *
 * @template TSource - The source resource (where the relation originates)
 * @template TTarget - The target resource (where the relation points to)
 * @template TName - The name of the relation
 * @template TCardinality - The cardinality of the relation (ONE or MANY)
 * @template TPathSeparator - The separator used in the relation path
 * @example
 * ```ts
 * const relation = new Relation(userResource, postResource, 'posts', RelationCardinality.MANY);
 * console.log(relation.path); // "user.posts"
 * ```
 */
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
  public readonly source: TSource;

  /** The target resource where the relation points to */
  public readonly target: TTarget;

  /** The cardinality of the relation (one or many) */
  public readonly cardinality: TCardinality;

  /** The fully-qualified relation path, e.g. "user.posts" */
  public readonly path: RelationPath<TSource, TName, TPathSeparator>;

  /**
   * Creates a new relation between two resources.
   *
   * @param source - The source resource
   * @param target - The target resource
   * @param name - The name of the relation
   * @param cardinality - The cardinality of the relation
   */
  public constructor(
    source: TSource,
    target: TTarget,
    name: TName,
    cardinality: TCardinality,
    pathSeparator: TPathSeparator
  ) {
    this.name = name;
    this.source = source;
    this.target = target;
    this.cardinality = cardinality;
    this.path = createPathFromSegments(
      [source.name, name],
      pathSeparator
    ) as RelationPath<TSource, TName, TPathSeparator>;
  }
}
