import { Request, Router } from "express";
import Server from "../classes/server";
import { RouteHandler, Get } from "../decorators/router-handler";
import { MessageService } from "../services/message.service";

@RouteHandler("/message")
class MessageRoute {
  // Services Injection
  public router: Router;

  constructor(public app: Server) {}

  @Get("/sms")
  public getSMSMessage(request: Request) {
    return MessageService.processGetSMSMessage(request);
  }

  @Get("/ussd")
  public getUSSDMessage(request: Request) {
    return MessageService.processGetUSSDMessage(request);
  }
}

export default MessageRoute;
