import type { AnyResource, AttributeFlags } from '@restkit/core';

type AttributeNameWithFlag<
  TResource extends AnyResource,
  TFlag extends keyof AttributeFlags,
  TValue extends boolean = true
> = {
  [K in keyof TResource['attributes']]: TResource['attributes'][K]['_flags'][TFlag] extends TValue
    ? K
    : never;
}[keyof TResource['attributes']];

export type ResourceSelectableFields<TResource extends AnyResource> =
  AttributeNameWithFlag<TResource, 'selectable'>;

export type ResourceFilterableFields<TResource extends AnyResource> =
  AttributeNameWithFlag<TResource, 'filterable'>;

export type ResourceSortableFields<TResource extends AnyResource> =
  AttributeNameWithFlag<TResource, 'sortable'>;
