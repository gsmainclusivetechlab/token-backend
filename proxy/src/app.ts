import * as dotenv from 'dotenv';

import IndexRoute from "./routes/index.route";
import LivenessProbeRoute from "./routes/liveness-probe.route";
import Server from "./classes/server";
import SMSGatewayRoute from './routes/sms-gateway.route';
import MessageRoute from './routes/message.route';
import USSDGatewayRoute from './routes/ussd-gateway.route';
import OperationsRoute from './routes/operations.route';

console.log('process.env.NODE_ENV:', process.env.NODE_ENV)
if (process.env.NODE_ENV === 'development') {
//   dotenv.config({ path: './env/.env.development' });
  dotenv.config({ path: '.env' });
} 
// else if (process.env.NODE_ENV === 'staging') {
//   dotenv.config({ path: './env/.env.staging' });
// } else if (process.env.NODE_ENV === 'production') {
//   dotenv.config({ path: './env/.env.production' });
// } else {
//   dotenv.config({ path: './env/.env.development' });
// }

// App Initialization
const app = new Server(process.env.PORT || 4000);

// Register routes on express
new LivenessProbeRoute(app);
new SMSGatewayRoute(app);
new USSDGatewayRoute(app);
new OperationsRoute(app);
new MessageRoute(app);

const index = new IndexRoute(app.getRoutes());
app.addRoute("/", index.router);
app.addDocsRoute();

app.addErrorHandler();
app.add404Handler();

app.start();

export { app as App };
