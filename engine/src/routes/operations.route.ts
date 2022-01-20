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
   * /operations/:action:
   *   get:
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
   *              amount: 100
   *            }
   * 
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
   *           description: Doesn't exist any user with this phone number or merchant available with that code.
   *           content:
   *            application/json:
   *              schema:
   *                type: object
   *                properties:
   *                  error:
   *                    type: string
   *                    example: "Doesn't exist any user with this phone number."
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
   * 
   *     CustomerInformation:
   *       type: object
   *       properties:
   *         nickName:
   *           type: string
   *           description: "Customer nick name"
   *         phoneNumber:
   *           type: string
   *           description: "Customer phone number"
   *         indicative:
   *           type: string
   *           description: "Contry code"
   *         active:
   *           type: boolean
   *           description: "Flag that indicate if the user have a token active or not"
   */
  @Post('/:action')
  public manageOperation(request: Request<{ action: Action }, {}, Operation, {}>) {
    const { action } = request.params;
    return OperationsService.manageOperation(action, request.body);
  }
}

export default OperationsRoute;
