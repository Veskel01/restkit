import type { AnyResource } from '../models/resource';

export type CombinedResources<T extends AnyResource[]> = {
  [K in T[number]['name']]: Extract<T[number], { name: K }>;
};

export function combineResources<T extends AnyResource[]>(
  ...resources: T
): CombinedResources<T> {
  const resourcesMap = new Map<string, AnyResource>();

  for (const resource of resources) {
    resourcesMap.set(resource.name, resource);
  }

  return Object.fromEntries(resourcesMap) as CombinedResources<T>;
}
