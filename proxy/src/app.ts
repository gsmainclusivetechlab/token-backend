import * as dotenv from 'dotenv';

import IndexRoute from './routes/index.route';
import LivenessProbeRoute from './routes/liveness-probe.route';
import Server from './classes/server';
import SMSGatewayRoute from './routes/sms-gateway.route';
import MessageRoute from './routes/message.route';
import USSDGatewayRoute from './routes/ussd-gateway.route';
import OperationsRoute from './routes/operations.route';
import AccountsRoute from './routes/accounts.route';

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
const app = new Server(process.env.PORT || 4000);

// Register routes on express
const livenessProbeRoute = new LivenessProbeRoute(app);
const smsGatewayRoute = new SMSGatewayRoute(app);
const ussdGatewayRoute = new USSDGatewayRoute(app);
const operationsRoute = new OperationsRoute(app);
const messageRoute = new MessageRoute(app);
const accountsRoute = new AccountsRoute(app);

const index = new IndexRoute(app.getRoutes());
app.addRoute('/', index.router);
app.addDocsRoute();

app.addErrorHandler();
app.add404Handler();

app.start();

export { app as App };
