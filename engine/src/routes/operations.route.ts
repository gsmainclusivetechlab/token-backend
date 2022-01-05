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


  /**
   * @openapi
   * /operations/account-info:
   *   get:
   *     tags:
   *        - "Operations"
   *     summary: Get user's account info
   *     description: Makes a request to the MMO API in order to get the user's account info
   *     parameters:
   *       - in: query
   *         name: token
   *         required: true
   *         description: Customer's token.
   *         schema:
   *           type: string
   *           example: "233120046954"
   *       - in: query
   *         name: amount
   *         required: true
   *         description: Operation amount.
   *         schema:
   *           type: string
   *           example: "200"
   */
  @Get("/account-info")
  public getSMSOperations(
    request: Request<{}, {}, {}, { token: string; amount: string }>
  ) {
    return OperationsService.getAccountInfo(
      request.query.amount,
      request.query.token
    );
  }

  /**
   * @openapi
   * /operations/{operation}/{action}:
   *   get:
   *     tags:
   *        - "Operations"
   *     summary: Get user's account info
   *     description: Makes a request to the MMO API in order to get the user's account info
   *     parameters:
   *       - in: path
   *         name: operation
   *         required: true
   *         description: Customer's operation.
   *         schema:
   *           type: string
   *           example: "cash-in"
   *       - in: path
   *         name: action
   *         required: true
   *         description: Agent's action.
   *         schema:
   *           type: string
   *           example: "accept"
   */
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
