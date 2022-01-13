import * as dotenv from 'dotenv';

import IndexRoute from "./routes/index.route";
import LivenessProbeRoute from "./routes/liveness-probe.route";
import Server from "./classes/server";
import HooksRoute from "./routes/hooks.route";
import OperationsRoute from './routes/operations.route';
import AccountsRoute from './routes/accounts.route';

dotenv.config({ path: '.env' });

// App Initialization
const app = new Server(process.env.PORT || 4400);

// Register routes on express
new LivenessProbeRoute(app);
new HooksRoute(app);
new OperationsRoute(app);
new AccountsRoute(app);

const index = new IndexRoute(app.getRoutes());
app.addRoute("/", index.router);
app.addDocsRoute();

app.addErrorHandler();
app.add404Handler();

app.start();

export { app as App };
