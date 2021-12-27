import { Request, Router } from "express";
import Server from "../classes/server";
import { RouteHandler, Post } from "../decorators/router-handler";
import { USSDGatewayService } from "../services/ussd-gateway.service";

@RouteHandler("/ussd-gateway")
class USSDGatewayRoute {
  // Services Injection
  public router: Router;

  constructor(public app: Server) {}

  @Post("/send")
  public sendSMSGateway(request: Request) {
    return USSDGatewayService.processSend(request);
  }

  @Post("/receive")
  public receiveSMSGateway(request: Request) {
    return USSDGatewayService.processReceive(request);
  }
}

export default USSDGatewayRoute;
