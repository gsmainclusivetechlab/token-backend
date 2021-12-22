// import * as dotenv from 'dotenv';

import IndexRoute from "./routes/index.route";
import LivenessProbeRoute from "./routes/liveness-probe.route";
import Server from "./classes/server";
import HooksRoute from "./routes/hooks.route";

// console.log('process.env.NODE_ENV:', process.env.NODE_ENV)
// if (process.env.NODE_ENV === 'development') {
//   dotenv.config({ path: './env/.env.development' });
// } else if (process.env.NODE_ENV === 'staging') {
//   dotenv.config({ path: './env/.env.staging' });
// } else if (process.env.NODE_ENV === 'production') {
//   dotenv.config({ path: './env/.env.production' });
// } else {
//   dotenv.config({ path: './env/.env.development' });
// }

// App Initialization
const app = new Server(process.env.PORT || 4400);

// Register routes on express
new LivenessProbeRoute(app);
new HooksRoute(app);

const index = new IndexRoute(app.getRoutes());
app.addRoute("/", index.router);

app.addErrorHandler();
app.add404Handler();

app.start();

export { app as App };
