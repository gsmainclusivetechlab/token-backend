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

  @Get("/account-info")
  public getAccountInfo(request: Request<{}, {}, {}, {token: string, amount: string}>) {
    const {token, amount} = request.query
    return OperationsService.getAccountInfo(token, amount);
  }

  @Post("/:operation")
  public startOperation(request: Request<{operation: Operation}, {}, {}, {token: string, amount: string}>) {
    const {token, amount} = request.query
    return OperationsService.startOperation(request.params.operation, token, amount);
  }
}

export default OperationsRoute;
