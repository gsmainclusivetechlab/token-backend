import { Request, Router } from 'express';
import Server from '../classes/server';
import { RouteHandler, Post } from '../decorators/router-handler';
import { Action, Operation } from '../interfaces/operation';
import { OperationsService } from '../services/operations.service';

@RouteHandler('/operations')
class OperationsRoute {
  // Services Injection
  public router: Router;

  constructor(public app: Server) {}

  /**
   * @openapi
   * /operations/{operation}/{action}:
   *   get:
   *     tags:
   *        - "Operations"
   *     summary: TODO
   *     description: TODO
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
  @Post('/:action')
  public manageOperation(request: Request<{ action: Action }, {}, Operation, {}>) {
    const { action } = request.params;
    return OperationsService.manageOperation(action, request.body);
  }
}

export default OperationsRoute;
