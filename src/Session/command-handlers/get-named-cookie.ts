import { NoSuchWindow } from '../../Error/errors';
import Pluma from '../../Types/types';

const getNamedCoookie: Pluma.CommandHandler = async ({
  session,
  urlVariables,
}) => {
  if (!session.browser.dom.window) throw new NoSuchWindow();
  const retrievedCookie = await session.browser.getNamedCookie(
    urlVariables.cookieName as string,
  );
  return { value: retrievedCookie };
};

export default getNamedCoookie;
