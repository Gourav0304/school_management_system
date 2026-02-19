const config = require('./config/index.config.js');
const ManagersLoader = require('./loaders/ManagersLoader.js');

require('./connect/mongo')({ uri: config.dotEnv.MONGO_URI });

process.on('uncaughtException', (err) => {
  console.log(`Uncaught Exception:`);
  console.log(err, err.stack);
  process.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
  console.log('Unhandled rejection at ', promise, `reason:`, reason);
  process.exit(1);
});

const cortex = {
  sub: () => {},
  pub: () => {},
};

const managersLoader = new ManagersLoader({ config, cache: null, cortex, oyster: null, aeon: null });
const managers = managersLoader.load();

managers.userServer.run();
