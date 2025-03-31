import type { AnyResource, PickAttributesByFlag } from '@restkit/core';

export type ResourceSelectableFields<TResource extends AnyResource> =
  PickAttributesByFlag<TResource, 'selectable'>;

export type ResourceFilterableFields<TResource extends AnyResource> =
  PickAttributesByFlag<TResource, 'filterable'>;

export type ResourceSortableFields<TResource extends AnyResource> =
  PickAttributesByFlag<TResource, 'sortable'>;
