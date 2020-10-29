import express from 'express';
import { COMMANDS } from '../constants/constants';
import * as utils from '../utils/utils';

const {
  defaultSessionEndpointLogic,
  sessionEndpointExceptionHandler,
} = utils.endpoint;

const action = express.Router();

action.post(
  '/',
  sessionEndpointExceptionHandler(
    defaultSessionEndpointLogic,
    COMMANDS.PERFORM_ACTIONS,
  ),
);

action.delete(
  '/',
  sessionEndpointExceptionHandler(
    defaultSessionEndpointLogic,
    COMMANDS.RELEASE_ACTIONS,
  ),
);

export default action;
