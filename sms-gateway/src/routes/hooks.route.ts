import { Request, Router } from "express";
import Server from "../classes/server";
import { RouteHandler, Post, Get } from "../decorators/router-handler";
import { TwilioService } from "../services/twilio.service";

@RouteHandler("/hooks")
class HooksRoute {
  // Services Injection
  public router: Router;

  constructor(public app: Server) {}

  @Post("/twilio")
  public hooks(request: Request) {
    return {"test": "hello"}
  }


}

export default HooksRoute;
