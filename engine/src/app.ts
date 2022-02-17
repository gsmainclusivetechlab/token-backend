import * as dotenv from 'dotenv';

import IndexRoute from './routes/index.route';
import LivenessProbeRoute from './routes/liveness-probe.route';
import Server from './classes/server';
import HooksRoute from './routes/hooks.route';
import OperationsRoute from './routes/operations.route';
import AccountsRoute from './routes/accounts.route';
import TransactionsRoute from './routes/transactions.route';

switch (process.env.NODE_ENV) {
  case 'development':
    dotenv.config({ path: '.env' });
    break;
  case 'staging':
  case 'production':
    break;
  default:
    break;
}

// App Initialization
const app = new Server(process.env.PORT || 4400);

// Register routes on express
const livenessProbeRoute = new LivenessProbeRoute(app);
const hooksRoute = new HooksRoute(app);
const operationsRoute = new OperationsRoute(app);
const accountsRoute = new AccountsRoute(app);
const transactionsRoute = new TransactionsRoute(app);

const index = new IndexRoute(app.getRoutes());
app.addRoute('/', index.router);
app.addDocsRoute();

app.addErrorHandler();
app.add404Handler();

app.start();

export { app as App };
