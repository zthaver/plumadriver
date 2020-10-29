import { InvalidArgument } from '../Error/errors';
import {
  isJsonWebElement,
  isNumber,
  isObject,
  isString,
  isUndefined,
} from '../utils/utils';
import Action from './Action';
import InputSource from './InputSource';

/** https://www.w3.org/TR/webdriver1/#processing-actions-requests */
export default class ActionRequestProcessor {
  /** https://www.w3.org/TR/webdriver1/#dfn-extract-an-action-sequence */
  static extractAtionSequence(
    activeInputSources: Map<string, InputSource>,
    params: Record<string, unknown>,
  ): Action[][] {
    const { actions } = params;
    if (!Array.isArray(actions)) throw new InvalidArgument();

    const actionsByTick: Action[][] = [];
    actions.forEach(actionSequence => {
      if (!isObject(actionSequence)) throw new InvalidArgument();
      const inputSourceActions = this.processActionSequence(
        activeInputSources,
        actionSequence,
      );
      inputSourceActions.forEach((action, i) => {
        if (actionsByTick.length < i + 1) actionsByTick.push([]);
        actionsByTick[i].push(action);
      });
    });

    return actionsByTick;
  }

  /** https://www.w3.org/TR/webdriver1/#dfn-process-an-input-source-action-sequence */
  static processActionSequence(
    activeInputSources: Map<string, InputSource>,
    actionSequence: Record<string, unknown>,
  ): Action[] {
    const {
      type,
      id,
      parameters: paramsData,
      actions: actionItems,
    } = actionSequence;

    if (!InputSource.TYPES.guard(type)) throw new InvalidArgument();
    if (!isString(id)) throw new InvalidArgument();

    const params = this.processPointerParams(
      type === 'pointer' ? paramsData : undefined,
    );
    let source = activeInputSources.get(id);
    if (!source) {
      source = new InputSource(id, type, params.pointerType);
      activeInputSources.set(id, source);
    }

    if (source.type !== type) throw new InvalidArgument();
    if (type === 'pointer' && source.subtype !== params.pointerType)
      throw new InvalidArgument();

    if (!Array.isArray(actionItems)) throw new InvalidArgument();
    const actions: Action[] = [];
    actionItems.forEach(actionItem => {
      if (!isObject(actionItem)) throw new InvalidArgument();

      let action: Action;
      if (type === 'none') action = this.processNullAction(id, actionItem);
      else if (type === 'key') action = this.processKeyAction(id, actionItem);
      else action = this.processPointerAction(id, params, actionItem);
      actions.push(action);
    });

    return actions;
  }

  /** https://www.w3.org/TR/webdriver1/#dfn-process-pointer-parameters */
  static processPointerParams(
    paramsData: unknown,
  ): { pointerType: InputSource['subtype'] } {
    const params = { pointerType: 'mouse' as InputSource['subtype'] };
    if (isUndefined(paramsData)) return params;
    if (!isObject(paramsData)) throw new InvalidArgument();

    const { pointerType } = paramsData;
    if (!isUndefined(pointerType)) {
      if (!InputSource.POINTER_SUBTYPES.guard(pointerType))
        throw new InvalidArgument();
      params.pointerType = pointerType;
    }

    return params;
  }

  /** https://www.w3.org/TR/webdriver1/#dfn-process-a-null-action */
  static processNullAction(
    id: string,
    actionItem: Record<string, unknown>,
  ): Action {
    const { subtype } = actionItem;
    if (!Action.NULL_SUBTYPES.guard(subtype)) throw new InvalidArgument();
    const action = new Action(id, 'none', subtype);
    const result = this.processPauseAction(actionItem, action);
    return result;
  }

  /** https://www.w3.org/TR/webdriver1/#dfn-process-a-pause-action */
  static processPauseAction(
    actionItem: Record<string, unknown>,
    action: Action,
  ): Action {
    const { duration = 0 } = actionItem;
    if (!isNumber(duration)) throw new InvalidArgument();
    action.duration = duration;
    return action;
  }

  /** https://www.w3.org/TR/webdriver1/#dfn-process-a-key-action */
  static processKeyAction(
    id: string,
    actionItem: Record<string, unknown>,
  ): Action {
    const { subtype, value: key } = actionItem;
    if (!Action.KEY_SUBTYPES.guard(subtype)) throw new InvalidArgument();
    const action = new Action(id, 'none', subtype);

    if (subtype === 'pause') {
      const result = this.processPauseAction(actionItem, action);
      return result;
    }

    if (!isString(key)) throw new InvalidArgument();
    action.value = key;
    return action;
  }

  /** https://www.w3.org/TR/webdriver1/#dfn-process-a-pointer-action */
  static processPointerAction(
    id: string,
    params: { pointerType: typeof InputSource.POINTER_SUBTYPES.type },
    actionItem: Record<string, unknown>,
  ): Action {
    const { subtype } = actionItem;
    if (!Action.POINTER_SUBTYPES.guard(subtype)) throw new InvalidArgument();
    const action = new Action(id, 'none', subtype);

    if (subtype === 'pause') {
      const result = this.processPauseAction(actionItem, action);
      return result;
    }

    action.pointerType = params.pointerType;
    if (subtype === 'pointerUp' || subtype === 'pointerDown')
      this.processPointerUpDown(actionItem, action);
    else if (subtype === 'pointerMove')
      this.processPointerMove(actionItem, action);
    else this.processPointerCancel();

    return action;
  }

  /** https://www.w3.org/TR/webdriver1/#dfn-process-a-pointer-up-or-pointer-down-action */
  static processPointerUpDown(
    actionItem: Record<string, unknown>,
    action: Action,
  ): void {
    const { button } = actionItem;
    if (!isNumber(button)) throw new InvalidArgument();
    action.button = button;
  }

  /** https://www.w3.org/TR/webdriver1/#dfn-process-a-pointer-move-action */
  static processPointerMove(
    actionItem: Record<string, unknown>,
    action: Action,
  ): void {
    const { duration = 0, origin = 'viewport', x = 0, y = 0 } = actionItem;
    if (!isNumber(duration))
      throw new InvalidArgument(
        `Duration must be an unsigned integer. Received: ${duration}`,
      );
    action.duration = duration;

    if (
      origin !== 'viewport' &&
      origin !== 'pointer' &&
      !isJsonWebElement(origin)
    )
      throw new InvalidArgument();
    action.origin = origin;

    if (!isNumber(x)) throw new InvalidArgument();
    action.x = x;

    if (!isNumber(y)) throw new InvalidArgument();
    action.y = y;
  }

  static processPointerCancel(): void {
    // Not specified by W3C
  }
}
