import * as dotenv from "dotenv";

import IndexRoute from "./routes/index.route";
import LivenessProbeRoute from "./routes/liveness-probe.route";
import Server from "./classes/server";
import SendRoute from "./routes/send.route";
import ReceiveRoute from "./routes/receive.route";
import { TwilioService } from "./services/twilio.service";

dotenv.config({ path: ".env" });

// App Initialization
const app = new Server(process.env.PORT || 4100);

// Register routes on express
new LivenessProbeRoute(app);
new SendRoute(app);
new ReceiveRoute(app);

const index = new IndexRoute(app.getRoutes());
app.addRoute("/", index.router);
app.addDocsRoute();

app.addErrorHandler();
app.add404Handler();
TwilioService.init()
app.start();

export { app as App };
