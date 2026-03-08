import app from './app.js';
import env from './config/env.js';
import logger from './logs/logger.js';

function main() {

  const port = process.env.PORT || env.port;

  app.listen(port, '0.0.0.0', () => {
    logger.info('Server on port ' + port);
  });

}

main();
