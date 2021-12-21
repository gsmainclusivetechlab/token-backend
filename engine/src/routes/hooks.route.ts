import { Request, Router } from "express";
// import { HooksService } from '../../services/hooks';

import Server from "../classes/server";
import { RouteHandler, Post } from "../decorators/router-handler";

@RouteHandler("/hooks")
class HooksRoute {
  // Services Injection
  public router: Router;

  constructor(public app: Server) {}

  @Post("/stripe")
  public stripeWebhooks(request: Request) {
    return new Promise((resolve) => {
      resolve({ text: "Oi" });
    }); //HooksService.stripeWebhooks(request);
  }
}

export default HooksRoute;
