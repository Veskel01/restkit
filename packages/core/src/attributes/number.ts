import { Attribute, AttributeType } from './attribute';

export class NumberAttribute extends Attribute<AttributeType.Number, number> {
  public constructor() {
    super({ def: {}, type: AttributeType.Number });
  }
}

export function number(): NumberAttribute {
  return new NumberAttribute();
}
