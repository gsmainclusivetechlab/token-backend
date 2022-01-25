import * as dotenv from 'dotenv';

import IndexRoute from './routes/index.route';
import LivenessProbeRoute from './routes/liveness-probe.route';
import Server from './classes/server';
import SendRoute from './routes/send.route';
import ReceiveRoute from './routes/receive.route';
import { TwilioService } from './services/twilio.service';
import HooksRoute from './routes/hooks.route';

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
const app = new Server(process.env.PORT || 4100);

// Register routes on express
const livenessProbeRoute = new LivenessProbeRoute(app);
const sendRoute = new SendRoute(app);
const receiveRoute = new ReceiveRoute(app);
const hooksRoute = new HooksRoute(app);

const index = new IndexRoute(app.getRoutes());
app.addRoute('/', index.router);
app.addDocsRoute();

app.addErrorHandler();
app.add404Handler();
TwilioService.init();
app.start();

export { app as App };
