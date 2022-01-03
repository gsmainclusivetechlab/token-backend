import { Request, Router } from "express";
import Server from "../classes/server";
import { RouteHandler, Post, Get } from "../decorators/router-handler";
import { AgentCashInOutBody, Operation } from "../interfaces/cash-in-out";
import { OperationsService } from "../services/operations.service";

@RouteHandler("/operations")
class OperationsRoute {
  // Services Injection
  public router: Router;

  constructor(public app: Server) {}

  @Get('/')
  public receiveOperation(request: Request<{operation: Operation}, {}, {}, {token: string, amount: string}>) {
    return OperationsService.receiveOperation();
  }

  @Get("/account-info")
  public getAccountInfo(request: Request<{}, {}, {}, {token: string, amount: string, type: Operation}>) {
    const {token, amount, type} = request.query
    return OperationsService.getAccountInfo(token, amount, type);
  }

  @Post('/notify')
  public createNotification(request: Request<{}, {}, {notification: string}>) {
    return OperationsService.createNotification(request.body.notification)
  }

  @Post("/:id")
  public startOperation(request: Request<{id: string}, {}>) {
    const {token, amount} = request.body
    return OperationsService.startOperation(request.params.id);
  }

}

export default OperationsRoute;
