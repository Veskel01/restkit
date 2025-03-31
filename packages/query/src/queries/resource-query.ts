import type { AnyResource } from '@restkit/core';
import {
  FieldSelector,
  type FieldSelectorMetadata,
  SELECT_ALL_FIELDS_OPERATOR,
  type SelectableFields
} from '../elements/field-selector';
import type { ResourceSelectableFields } from '../types';

export interface QueryState<TResource extends AnyResource> {
  select: FieldSelectorMetadata<TResource, SelectableFields<TResource>>;
}

type SetStateValue<
  TResource extends AnyResource,
  TState extends QueryState<TResource>,
  TKey extends keyof TState,
  TValue
> = Omit<TState, TKey> & {
  [P in TKey]: TValue;
};

export class ResourceQuery<
  TResource extends AnyResource,
  TState extends QueryState<TResource>
> {
  private readonly resource: TResource;
  private readonly state: TState;

  private readonly fieldSelector: FieldSelector<TResource>;

  public constructor(resource: TResource, state: TState) {
    this.resource = resource;
    this.fieldSelector = new FieldSelector(resource);
    this.state = state;
  }

  // TODO - remove me
  public getState(): TState {
    return this.state;
  }

  public select<TFields extends ResourceSelectableFields<TResource>[]>(
    ...fields: TFields
  ): ResourceQuery<
    TResource,
    SetStateValue<
      TResource,
      TState,
      'select',
      FieldSelectorMetadata<TResource, TFields>
    >
  > {
    return new ResourceQuery(this.resource, {
      ...this.state,
      select: this.fieldSelector.select(...fields).getMetadata()
    });
  }

  public selectAll(): ResourceQuery<
    TResource,
    SetStateValue<
      TResource,
      TState,
      'select',
      FieldSelectorMetadata<TResource, typeof SELECT_ALL_FIELDS_OPERATOR>
    >
  > {
    return new ResourceQuery(this.resource, {
      ...this.state,
      select: this.fieldSelector
        .select(SELECT_ALL_FIELDS_OPERATOR)
        .getMetadata()
    });
  }
}
