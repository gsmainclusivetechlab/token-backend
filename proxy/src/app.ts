import * as dotenv from 'dotenv';

import IndexRoute from "./routes/index.route";
import LivenessProbeRoute from "./routes/liveness-probe.route";
import Server from "./classes/server";
import SMSGatewayRoute from './routes/sms-gateway.route';
import MessageRoute from './routes/message.route';
import USSDGatewayRoute from './routes/ussd-gateway.route';
import OperationsRoute from './routes/operations.route';
import AccountsRoute from './routes/accounts.route';

dotenv.config({ path: '.env' });

// App Initialization
const app = new Server(process.env.PORT || 4000);

// Register routes on express
new LivenessProbeRoute(app);
new SMSGatewayRoute(app);
new USSDGatewayRoute(app);
new OperationsRoute(app);
new MessageRoute(app);
new AccountsRoute(app);

const index = new IndexRoute(app.getRoutes());
app.addRoute("/", index.router);
app.addDocsRoute();

app.addErrorHandler();
app.add404Handler();

app.start();

export { app as App };
