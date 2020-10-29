import Session from '../Session/Session';
import { isNumber } from '../utils/utils';
import Action from './Action';
import InputSource from './InputSource';

/** https://www.w3.org/TR/webdriver1/#dispatching-actions */
export default class ActionDispatcher {
  /** https://www.w3.org/TR/webdriver1/#dfn-dispatch-actions */
  static async dispatchActions(
    session: Session,
    actionsByTick: Action[][],
  ): Promise<void> {
    // eslint-disable-next-line no-restricted-syntax
    for (const tickActions of actionsByTick) {
      const tickDuration = this.computeTickDuration(tickActions);
      const timer = new Promise(res => setTimeout(res, tickDuration));
      const lastInvocation = this.dispatchTickActions(
        session,
        tickActions,
        tickDuration,
      );
      await Promise.all([lastInvocation, timer]);
    }
  }

  /** https://www.w3.org/TR/webdriver1/#dfn-computing-the-tick-duration */
  static computeTickDuration(tickActions: Action[]): number {
    let maxDuration = 0;
    tickActions.forEach(action => {
      let duration;
      if (
        action.subtype === 'pause' ||
        (action.type === 'pointer' && action.subtype === 'pointerMove')
      )
        duration = action.duration;
      if (isNumber(duration) && duration > maxDuration) maxDuration = duration;
    });
    return maxDuration;
  }

  /** https://www.w3.org/TR/webdriver1/#dfn-dispatch-tick-actions */
  static async dispatchTickActions(
    session: Session,
    tickActions: Action[],
    tickDuration: number,
  ): Promise<void> {
    // eslint-disable-next-line no-restricted-syntax
    for (const action of tickActions) {
      const { activeInputSources } = session;
      const { id, type, subtype } = action;

      let source = activeInputSources.get(id);
      if (!source) {
        source = new InputSource(id, type);
        activeInputSources.set(id, source);
      }

      const algorithm = this.DISPATCH_ACTION_ALGORITHMS.find(
        ([algorithmSourceType, algorithmSubtype]) =>
          algorithmSourceType === type && algorithmSubtype === subtype,
      )?.[2];
      await algorithm?.(session, id, action, source, tickDuration);
    }
  }

  // dispatch action algorithms
  static DISPATCH_ACTION_ALGORITHMS = [
    ['none', 'pause', ActionDispatcher.dispatchPauseAction],
    ['key', 'pause', ActionDispatcher.dispatchPauseAction],
    ['key', 'keyDown', ActionDispatcher.dispatchKeyDownAction],
    ['key', 'keyUp', ActionDispatcher.dispatchKeyUpAction],
    ['pointer', 'pause', ActionDispatcher.dispatchPauseAction],
    ['pointer', 'pointerDown', ActionDispatcher.dispatchPointerDownAction],
    ['pointer', 'pointerUp', ActionDispatcher.dispatchPointerUpAction],
    ['pointer', 'pointerMove', ActionDispatcher.dispatchPointerMoveAction],
    ['pointer', 'pointerCancel', ActionDispatcher.dispatchPointerCancelAction],
  ] as const;

  /** https://www.w3.org/TR/webdriver1/#dfn-dispatch-a-pause-action */
  static async dispatchPauseAction(): Promise<void> {
    // empty logic
  }

  /** https://www.w3.org/TR/webdriver1/#dfn-dispatch-a-keydown-action */
  static async dispatchKeyDownAction(
    _session: Session,
    _id: string,
    _action: Action,
    _source: InputSource,
    _tickDuration: number,
  ): Promise<void> {
    // TODO: implement logic
  }

  /** https://www.w3.org/TR/webdriver1/#dfn-dispatch-a-keyup-action */
  static async dispatchKeyUpAction(
    _session: Session,
    _id: string,
    _action: Action,
    _source: InputSource,
    _tickDuration: number,
  ): Promise<void> {
    // TODO: implement logic
  }

  /** https://www.w3.org/TR/webdriver1/#dfn-dispatch-a-pointerdown-action */
  static async dispatchPointerDownAction(
    _session: Session,
    _id: string,
    _action: Action,
    _source: InputSource,
    _tickDuration: number,
  ): Promise<void> {
    // TODO: implement logic
  }

  /** https://www.w3.org/TR/webdriver1/#dfn-dispatch-a-pointerup-action */
  static async dispatchPointerUpAction(
    _session: Session,
    _id: string,
    _action: Action,
    _source: InputSource,
    _tickDuration: number,
  ): Promise<void> {
    // TODO: implement logic
  }

  /** https://www.w3.org/TR/webdriver1/#dfn-dispatch-a-pointermove-action */
  static async dispatchPointerMoveAction(
    _session: Session,
    _id: string,
    _action: Action,
    _source: InputSource,
    _tickDuration: number,
  ): Promise<void> {
    // TODO: implement logic
  }

  /** https://www.w3.org/TR/webdriver1/#dfn-dispatch-a-pointercancel-action */
  static async dispatchPointerCancelAction(
    _session: Session,
    _id: string,
    _action: Action,
    _source: InputSource,
    _tickDuration: number,
  ): Promise<void> {
    // TODO: implement logic
  }
}
