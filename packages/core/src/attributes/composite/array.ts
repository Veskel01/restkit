import {
  type AnyAttribute,
  Attribute,
  AttributeType,
  type InferAttributeOutput
} from '../root';

export interface ArrayAttributeDef<TItem extends AnyAttribute> {
  itemType: TItem;
}

export class ArrayAttribute<TItem extends AnyAttribute> extends Attribute<
  AttributeType.ARRAY,
  InferAttributeOutput<TItem>[],
  ArrayAttributeDef<TItem>
> {
  public constructor(itemType: TItem) {
    super({
      def: {
        itemType
      },
      type: AttributeType.ARRAY
    });
  }
}

export function array<TItem extends AnyAttribute>(
  itemType: TItem
): ArrayAttribute<TItem> {
  return new ArrayAttribute(itemType);
}
