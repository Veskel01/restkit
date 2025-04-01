import { Attribute, AttributeType } from '../root';

export class NumberAttribute extends Attribute<AttributeType.NUMBER, number> {
  public constructor() {
    super({ def: {}, type: AttributeType.NUMBER });
  }
}

export function number(): NumberAttribute {
  return new NumberAttribute();
}
