import ActionDispatcher from '../../Action/ActionDispatcher';
import ActionRequestProcessor from '../../Action/ActionRequestProcessor';
import { NoSuchWindow } from '../../Error/errors';
import Pluma from '../../Types/types';

/** https://www.w3.org/TR/webdriver1/#perform-actions */
const performActions: Pluma.CommandHandler = async ({
  session,
  parameters,
}) => {
  const actionByTicks = ActionRequestProcessor.extractAtionSequence(
    session,
    parameters,
  );
  if (!session.browser.dom.window) throw new NoSuchWindow();
  await ActionDispatcher.dispatchActions(session, actionByTicks);
  return null;
};

export default performActions;
