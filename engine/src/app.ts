import * as dotenv from 'dotenv';

import IndexRoute from "./routes/index.route";
import LivenessProbeRoute from "./routes/liveness-probe.route";
import Server from "./classes/server";
import HooksRoute from "./routes/hooks.route";
import OperationsRoute from './routes/operations.route';
import swaggerJSDoc from 'swagger-jsdoc'

dotenv.config({ path: '.env' });

const swaggerDefinition = {
  openapi: '3.0.0',
  info: {
    title: 'Express API for JSONPlaceholder',
    version: '1.0.0',
  },
};

const options = {
  swaggerDefinition,
  // Paths to files containing OpenAPI definitions
  apis: ['./routes/*.js'],
};

const swaggerSpec = swaggerJSDoc(options);

// App Initialization
const app = new Server(process.env.PORT || 4400);

// Register routes on express
new LivenessProbeRoute(app);
new HooksRoute(app);
new OperationsRoute(app);

const index = new IndexRoute(app.getRoutes());
app.addRoute("/", index.router);

app.addErrorHandler();
app.add404Handler();

app.start();

export { app as App };
