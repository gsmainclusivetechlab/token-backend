import { Request, Router } from "express";
import Server from "../classes/server";
import { RouteHandler, Post, Get } from "../decorators/router-handler";
import { SendService } from "../services/send.service";
import { TwilioService } from "../services/twilio.service";

@RouteHandler("/hooks")
class HooksRoute {
  // Services Injection
  public router: Router;

  constructor(public app: Server) {}

  @Post("/twilio")
  public hooks(request: Request) {
    request.body = TwilioService.parseMessage(request.body)
    return SendService.processSend(request)
  }


}

export default HooksRoute;
