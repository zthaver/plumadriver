import ActionDispatcher from '../../Action/ActionDispatcher';
import { NoSuchWindow } from '../../Error/errors';
import Pluma from '../../Types/types';

/** https://www.w3.org/TR/webdriver1/#release-actions */
const releaseActions: Pluma.CommandHandler = async ({ session }) => {
  if (!session.browser.dom.window) throw new NoSuchWindow();
  const undoActions = session.inputCancelList.reverse();
  await ActionDispatcher.dispatchTickActions(session, undoActions, 0);
  session.inputCancelList.length = 0;
  session.activeInputSources.clear();
  return null;
};

export default releaseActions;
