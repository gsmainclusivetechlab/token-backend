import * as dotenv from 'dotenv';

import IndexRoute from "./routes/index.route";
import LivenessProbeRoute from "./routes/liveness-probe.route";
import Server from "./classes/server";
import TokensRoute from "./routes/token.route";

if (process.env.NODE_ENV === 'development') {
  dotenv.config({ path: '.env' });
} else if (process.env.NODE_ENV === 'staging') {
  dotenv.config({ path: '.env' });
} else if (process.env.NODE_ENV === 'production') {
  dotenv.config({ path: '.env' });
} else {
  dotenv.config({ path: '.env' });
}

// App Initialization
const app = new Server(process.env.PORT || 3700);

// Register routes on express
new LivenessProbeRoute(app);
new TokensRoute(app);

const index = new IndexRoute(app.getRoutes());
app.addRoute("/", index.router);

app.addErrorHandler();
app.add404Handler();

app.start();

export { app as App };
