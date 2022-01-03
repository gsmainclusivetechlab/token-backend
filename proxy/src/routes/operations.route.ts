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
  public getAccountInfo(request: Request<{}, {}, {}, {token: string, amount: string}>) {
    const {token, amount} = request.query
    return OperationsService.getAccountInfo(token, amount);
  }

  @Post("/:id/:operation")
  public startOperation(request: Request<{id: string, operation: Operation}, {}, {token: string, amount: string}>) {
    const {token, amount} = request.body
    return OperationsService.startOperation(request.params.id, request.params.operation, token, amount);
  }
}

export default OperationsRoute;
