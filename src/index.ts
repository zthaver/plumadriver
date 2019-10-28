import * as express from 'express';
import * as argv from 'minimist'; // for user provided port
import * as bodyParser from 'body-parser';
import { logger, errorLogger } from './logger/logger';
import { Pluma } from './Types/types';

import { SessionManager } from './SessionManager/SessionManager';
import router from './routes/index';

const args = argv(process.argv.slice(2));
const server = express();
const HTTP_PORT = process.env.PORT || args.port || 3000;
process.env.NODE_ENV = process.env.NODE_ENV || 'dev';

const sessionManager = new SessionManager();

server.set('sessionManager', sessionManager);

// middleware
server.use(bodyParser.json());

// request logging
server.use(logger);

router.get('/status', (req, res) => {
  const state = sessionManager.getReadinessState();
  res.status(200).json(state);
});

server.use('/', router);

// error logging
server.use(errorLogger);

// error handler
// eslint-disable-next-line no-unused-vars
server.use((err, req, res, next) => {
  const errorResponse: Pluma.ErrorResponse = {
    value: {
      error: err.JSONCodeError,
      message: err.message,
      stacktrace: err.stack,
    },
  };
  res.status(err.code || err.status || 500).json(errorResponse);
});

server.listen(HTTP_PORT, () => {
  console.log(`plumadriver listening on port ${HTTP_PORT}`);
});

export { server };
