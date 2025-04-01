import { Attribute, AttributeType } from '../root';

export class DateAttribute extends Attribute<AttributeType.DATE, Date> {
  public constructor() {
    super({ def: {}, type: AttributeType.DATE });
  }
}

export function date(): DateAttribute {
  return new DateAttribute();
}
