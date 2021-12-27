import { Request, Router } from "express";
import Server from "../classes/server";
import { RouteHandler, Post } from "../decorators/router-handler";
import { SendService } from "../services/send.service";

@RouteHandler("/send")
class SendRoute {
  // Services Injection
  public router: Router;

  constructor(public app: Server) {}

  @Post("/")
  public send(request: Request) {
    return SendService.processSend(request);
  }
}

export default SendRoute;
