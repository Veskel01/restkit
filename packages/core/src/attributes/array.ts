import {
  type AnyAttribute,
  Attribute,
  AttributeType,
  type InferAttributeOutput
} from './attribute';

export interface ArrayAttributeDef<TItem extends AnyAttribute> {
  item: TItem;
}

export class ArrayAttribute<TItem extends AnyAttribute> extends Attribute<
  AttributeType.Array,
  InferAttributeOutput<TItem>[],
  ArrayAttributeDef<TItem>
> {
  public constructor(item: TItem) {
    super({ def: { item }, type: AttributeType.Array });
  }
}

export function array<TItem extends AnyAttribute>(
  item: TItem
): ArrayAttribute<TItem> {
  return new ArrayAttribute(item);
}
