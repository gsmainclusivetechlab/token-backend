import { Request, Router } from "express";
import { Operation, Action } from "../interfaces/cash-in-out";
import Server from "../classes/server";
import { RouteHandler, Post, Get } from "../decorators/router-handler";
import { OperationsService } from "../services/operations.service";

@RouteHandler("/operations")
class OperationsRoute {
  // Services Injection
  public router: Router;

  constructor(public app: Server) {}

  @Get("/account-info")
  public getSMSOperations(
    request: Request<{}, {}, {}, { token: string; amount: string }>
  ) {
    return OperationsService.getAccountInfo(
      request.query.amount,
      request.query.token
    );
  }

  @Post("/:operation/:action")
  public startOperation(
    request: Request<
      { operation: Operation; action: Action },
      {},
      { token: string; amount: string },
      {}
    >
  ) {
    const { token, amount } = request.body;
    return OperationsService.startOperation(
      request.params.operation,
      request.params.action,
      token,
      amount
    );
  }
}

export default OperationsRoute;
