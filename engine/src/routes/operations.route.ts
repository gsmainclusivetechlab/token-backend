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
   * /operations/{action}:
   *   post:
   *     tags:
   *        - "Operations"
   *     summary: Manage operations
   *     description: Makes a request to the MMO API to process the action selected in the operation. 
   *                  If the action is "accept", the operation will be saved in memory
   *     parameters:
   *       - in: path
   *         name: action
   *         required: true
   *         description: Agent's action.
   *         schema:
   *           type: string
   *           example: "accept"
   *     requestBody:
   *      required: true
   *      content:
   *        application/json:
   *          schema:
   *            $ref: "#/components/schemas/Operation"
   *          example: 
   *            {
   *              type: "cash-in",
   *              system: "mock",
   *              identifier: "+233207212676",
   *              amount: 100,
   *              createdBy: "customer",
   *              createdUsing: "SMS"
   *            }
   * 
   *     responses:
   *        '200':
   *           description: OK
   *           content:
   *            application/json:
   *              schema:
   *                type: object
   *                properties:
   *                  status:
   *                    type: string
   *                    example: "Pending"
   * 
   *        '400':
   *           description: Invalid Request.
   *           content:
   *              application/json:
   *                schema:
   *                  type: object
   *                  properties:
   *                    message:
   *                      type: string
   * 
   *        '404':
   *           description: A customer with this mobile number or token does not exist or a Merchant with this code does not exist.
   *           content:
   *            application/json:
   *              schema:
   *                type: object
   *                properties:
   *                  error:
   *                    type: string
   *                    example: "A customer with this mobile number or token does not exist."
   * 
   * components:
   *  schemas:
   *     Operation:
   *       type: object
   *       properties:
   *         identifier:
   *           type: string
   *           description: "Token or Phone Number value"
   *         identifierType:
   *           type: string
   *           description: "Identify what is the identifier. Value can be 'token' or 'phoneNumber'"
   *         amount:
   *           type: number
   *           description: "Value associated with the operation"
   *         type:
   *           type: string
   *           description: "Type of operation. Value can be 'cash-in', 'cash-out' or 'merchant-payment'"
   *         system:
   *           type: string
   *           description: "System that is used. Value can be 'live' or 'mock'"
   *         merchantCode:
   *           type: string
   *           description: "Merchant identifier code"
   *         customerInfo:
   *           $ref: "#/components/schemas/CustomerInformation"
   *         createdBy:
   *           type: string
   *           description: "Who create the operation. Value can be 'customer', 'agent' or 'merchant'"
   *         createdUsing:
   *           type: string
   *           description: "Which mode was used to create the operation. Value can be 'SMS' or 'USSD'"
   */
  @Post('/:action')
  public manageOperation(request: Request<{ action: Action }, {}, Operation, {}>) {
    const { action } = request.params;
    return OperationsService.manageOperation(action, request.body);
  }
}

export default OperationsRoute;
