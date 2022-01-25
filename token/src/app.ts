import * as dotenv from 'dotenv';

import IndexRoute from './routes/index.route';
import LivenessProbeRoute from './routes/liveness-probe.route';
import Server from './classes/server';
import TokensRoute from './routes/token.route';

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
const app = new Server(process.env.PORT || 3700);

// Register routes on express
const livenessProbeRoute = new LivenessProbeRoute(app);
const tokensRoute = new TokensRoute(app);

const index = new IndexRoute(app.getRoutes());
app.addRoute('/', index.router);
app.addDocsRoute();

app.addErrorHandler();
app.add404Handler();

app.start();

export { app as App };
