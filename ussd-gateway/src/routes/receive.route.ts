import { Request, Router } from "express";
import Server from "../classes/server";
import { RouteHandler, Post } from "../decorators/router-handler";
import { ReceiveService } from "../services/receive.service";

@RouteHandler("/receive")
class ReceiveRoute {
  // Services Injection
  public router: Router;

  constructor(public app: Server) {}

  @Post("/")
  public receive(request: Request) {
    return ReceiveService.processReceive(request);
  }
}

export default ReceiveRoute;
