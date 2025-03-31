import type { AnyResource, ResourcePathsByFlag } from '@restkit/core';

export type ResourceSelectableFields<TResource extends AnyResource> =
  ResourcePathsByFlag<TResource, 'selectable', true>;

export type ResourceFilterableFields<TResource extends AnyResource> =
  ResourcePathsByFlag<TResource, 'filterable', true>;

export type ResourceSortableFields<TResource extends AnyResource> =
  ResourcePathsByFlag<TResource, 'sortable', true>;
