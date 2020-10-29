import { InvalidArgument } from '../Error/errors';
import StringUnion from '../utils/StringUnion';
import { isUnsignedInteger } from '../utils/utils';

/** https://www.w3.org/TR/webdriver1/#dfn-input-sources */
export default class InputSource {
  readonly id: string;

  readonly type: typeof InputSource.TYPES.type;

  readonly subtype: typeof InputSource.POINTER_SUBTYPES.type;

  // key input source states
  pressedKeys: string[] = [];

  alt = false;

  shift = false;

  ctrl = false;

  meta = false;

  // pointer input source states
  private _pressedButtons: number[] = [];

  private _x = 0;

  private _y = 0;

  constructor(
    id: string,
    type: InputSource['type'],
    subtype: InputSource['subtype'] = 'mouse',
  ) {
    this.id = id;
    this.type = type;
    this.subtype = subtype;
  }

  get pressedButtons(): number[] {
    return this._pressedButtons;
  }

  set pressedButtons(value: number[]) {
    if (!value.every(isUnsignedInteger))
      throw new InvalidArgument(
        `Buttons must be an unsigned integers. Received: ${value}`,
      );
    this._pressedButtons = value;
  }

  get x(): number {
    return this._x;
  }

  set x(value: number) {
    if (!isUnsignedInteger(value))
      throw new InvalidArgument(
        `Position x must be an unsigned integer. Received: ${value}`,
      );
    this._x = value;
  }

  get y(): number {
    return this._y;
  }

  set y(value: number) {
    if (!isUnsignedInteger(value))
      throw new InvalidArgument(
        `Position y must be an unsigned integer. Received: ${value}`,
      );
    this._y = value;
  }

  static TYPES = StringUnion('none', 'key', 'pointer');

  static POINTER_SUBTYPES = StringUnion('mouse', 'pen', 'touch');
}
