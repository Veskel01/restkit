import type { AnyResource } from '../models/resource';

/**
 * Converts an array of resources into a typed object map where each key
 * is the resource's `name` and the value is the corresponding resource definition.
 *
 * This is useful when working with functions or structures that expect a `ResourceMap`
 * instead of an array.
 *
 * @template T - Tuple of resources
 *
 * @example
 * ```ts
 * const user = { name: 'user', ... } as const;
 * const post = { name: 'post', ... } as const;
 *
 * type Result = CombinedResources<[typeof user, typeof post]>;
 * // {
 * //   user: typeof user;
 * //   post: typeof post;
 * // }
 * ```
 */
export type CombinedResources<T extends AnyResource[]> = {
  [K in T[number]['name']]: Extract<T[number], { name: K }>;
};

/**
 * Combines an array of resources into an object map,
 * where each resource is keyed by its `name` property.
 *
 * If multiple resources share the same name, the last one wins.
 *
 * Typically used to convert a list of resource definitions into a `ResourceMap`
 * for use in relation graphs or resource-based systems.
 *
 * @param resources - An array of resources to combine
 * @returns A typed object where each resource is keyed by its name
 *
 * @example
 * ```ts
 * const graph = createRelationGraph(
 *   combineResources(userResource, postResource),
 *   (connector) => ({ ... })
 * );
 * ```
 */
export function combineResources<T extends AnyResource[]>(
  ...resources: T
): CombinedResources<T> {
  const resourcesMap = new Map<string, AnyResource>();

  for (const resource of resources) {
    resourcesMap.set(resource.name, resource);
  }

  return Object.fromEntries(resourcesMap) as CombinedResources<T>;
}
