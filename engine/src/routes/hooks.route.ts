import { Request, Router } from "express";
import { HooksService } from '../services/hooks.service';
import Server from "../classes/server";
import { RouteHandler, Post } from "../decorators/router-handler";

@RouteHandler("/hooks")
class HooksRoute {
  // Services Injection
  public router: Router;

  constructor(public app: Server) {}

  @Post("/sms-gateway")
  public smsGatewayWebhooks(request: Request) {
    return HooksService.processSMSGateway(request);
  }

  @Post("/ussd-gateway")
  public ussdGatewayWebhooks(request: Request) {
    return HooksService.processUSSDGateway(request);
  }

  @Post("/mmo")
  public mmoWebhooks(request: Request) {
    return HooksService.processMMO(request);
  }
}

export default HooksRoute;
