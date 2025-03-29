import { Attribute, AttributeType } from './attribute';

export class BooleanAttribute extends Attribute<
  AttributeType.Boolean,
  boolean
> {
  public constructor() {
    super({ def: {}, type: AttributeType.Boolean });
  }
}

export function boolean(): BooleanAttribute {
  return new BooleanAttribute();
}
