import { Request, Router } from "express";
import Server from "../classes/server";
import { RouteHandler, Post } from "../decorators/router-handler";
import { SMSGatewayService } from "../services/sms-gateway.service";

@RouteHandler("/sms-gateway")
class SMSGatewayRoute {
  // Services Injection
  public router: Router;

  constructor(public app: Server) {}

  @Post("/send")
  public sendSMSGateway(request: Request) {
    return SMSGatewayService.processSend(request);
  }

  @Post("/receive")
  public receiveSMSGateway(request: Request) {
    return SMSGatewayService.processReceive(request);
  }
}

export default SMSGatewayRoute;
