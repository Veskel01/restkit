import { Attribute, AttributeType } from '../root';

export class BooleanAttribute extends Attribute<
  AttributeType.BOOLEAN,
  boolean
> {
  public constructor() {
    super({ def: {}, type: AttributeType.BOOLEAN });
  }
}

export function boolean(): BooleanAttribute {
  return new BooleanAttribute();
}
