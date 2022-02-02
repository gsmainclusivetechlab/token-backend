import { Request, Router } from 'express';
import { UserFacingError } from '../classes/errors';
import Server from '../classes/server';
import { RouteHandler, Post, Get, Delete } from '../decorators/router-handler';
import { Action, CreateOperationBody, OperationNotification } from '../interfaces/operations';
import { OperationsService } from '../services/operations.service';

@RouteHandler('/operations')
class OperationsRoute {
  // Services Injection
  public router: Router;

  constructor(public app: Server) {}

  /**
   * @openapi
   * paths:
   *  /operations:
   *     get:
   *      tags:
   *          - "Operations"
   *      summary: Return all operations and notifications
   *      description: Return all operations and notifications in memory
   *      parameters:
   *       - in: header
   *         name: sessionId
   *         description: Customer session id (OTP)
   *         required: true
   *         schema:
   *           type: number
   *           example: 1234
   *      responses:
   *        '200':
   *          description: OK
   *          content:
   *            application/json:
   *              schema:
   *                type: object
   *                properties:
   *                  notifications:
   *                    type: array
   *                    items:
   *                      $ref: "#/components/schemas/Notification"
   *                    example:
   *                      [
   *                        {
   *                          id: "408a6a77-2dc4-463e-8cca-02055c83a293",
   *                          message: "Test",
   *                          otp: 1234
   *                        }
   *                      ]
   *
   *                  operations:
   *                    type: array
   *                    items:
   *                      $ref: "#/components/schemas/Operation"
   *                    example:
   *                      [
   *                        {
   *                          id: "408a6a77-2dc4-463e-8cca-02055c83a293",
   *                          identifier: "233207212676",
   *                          identifierType: "token",
   *                          amount: 100,
   *                          type: "cash-in",
   *                          customerInfo: {
   *                            nickName: "Teste",
   *                            phoneNumber: "+441632960067",
   *                            indicative: "+44",
   *                            active: true,
   *                            otp: 1234
   *                          },
   *                          system: "mock"
   *                         }
   *                      ]
   *
   * components:
   *  schemas:
   *    Notification:
   *      type: object
   *      properties:
   *        id:
   *          type: string
   *          description: "Notification id"
   *        message:
   *          type: string
   *          description: "Message"
   *        otp:
   *          type: number
   *          description: "Customer one time password"
   * 
   *    Operation:
   *      allOf:
   *        - $ref: "#/components/schemas/CreateOperationBody"
   *        - type: object
   *          properties:
   *            id:
   *              type: string
   *              description: "Operation id"
   *    CustomerInformation:
   *      type: object
   *      properties:
   *        nickName:
   *          type: string
   *          description: "Customer nick name"
   *        phoneNumber:
   *          type: string
   *          description: "Customer phone number"
   *        indicative:
   *          type: string
   *          description: "Contry code"
   *        active:
   *          type: boolean
   *          description: "Flag that indicate if the user have a token active or not"
   *        otp:
   *          type: number
   *          description: "Customer one time password"
   *
   */
  @Get('/')
  public getOperationsAndNotifications(request: Request<{}, {}, {}, {}>) {
    return OperationsService.getOperationsAndNotifications(request);
  }

  /**
   * @openapi
   * /operations:
   *   post:
   *     tags:
   *        - "Operations"
   *     summary: Create an operation
   *     description: Makes a request to the Engine API in order to get the user's account info,
   *                  and if the user's account exist, the system create the operation in memory
   *     parameters:
   *       - in: header
   *         name: sessionId
   *         description: Customer session id (OTP)
   *         required: true
   *         schema:
   *           type: number
   *           example: 1234
   *     requestBody:
   *      required: true
   *      content:
   *        application/json:
   *          schema:
   *            $ref: "#/components/schemas/Operation"
   *          example:
   *              {
   *                identifier: "233207212676",
   *                amount: 100,
   *                type: "cash-in",
   *                system: "mock"
   *              }
   *
   *     responses:
   *        '200':
   *           description: OK
   *           content:
   *             application/json:
   *                schema:
   *                  type: object
   *                  schema:
   *                    $ref: "#/components/schemas/CreateOperationBody"
   *                  example:
   *                    {
   *                      identifier: "233207212676",
   *                      identifierType: "token",
   *                      amount: 100,
   *                      type: "cash-in",
   *                      customerInfo: {
   *                        nickName: "Teste",
   *                        phoneNumber: "+441632960067",
   *                        indicative: "+44",
   *                        active: true,
   *                        otp: 1234
   *                      },
   *                      system: "mock"
   *                    }
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
   * components:
   *   schemas:
   *     CreateOperationBody:
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
   */
  @Post('/')
  public createOperation(request: Request<{}, {}, CreateOperationBody, {}>) {
    return OperationsService.createOperation(request);
  }

  /**
   * @openapi
   * /operations/register:
   *   post:
   *     tags:
   *        - "Operations"
   *     summary: Create an operation
   *     description: Create an operation in memory
   *     parameters:
   *      - in: header
   *        name: sessionId
   *        description: Customer session id (OTP)
   *        required: true
   *        schema:
   *          type: number
   *          example: 1234
   *     requestBody:
   *      required: true
   *      content:
   *        application/json:
   *          schema:
   *            $ref: "#/components/schemas/Operation"
   *          example:
   *              {
   *                 identifier: "233207212676",
   *                 identifierType: "token",
   *                 amount: 100,
   *                 type: "cash-in",
   *                 customerInfo: {
   *                   nickName: "Teste",
   *                   phoneNumber: "+441632960067",
   *                   indicative: "+44",
   *                   active: true,
   *                   otp: 1234
   *                 },
   *                 system: "mock"
   *               }
   *     responses:
   *        '200':
   *           description: OK
   *           content:
   *            application/json:
   *              schema:
   *                type: object
   *                properties:
   *                  message:
   *                    type: string
   *                    example: "Operation registered successfully"
   *
   */
  @Post('/register')
  public registerOperation(request: Request<{}, {}, CreateOperationBody>) {
    return OperationsService.registerOperation(request);
  }

  /**
   * @openapi
   * /operations/{action}/{id}:
   *   post:
   *     tags:
   *      - "Operations"
   *     summary: Manage operations
   *     description: Makes a request to the Engine API to process the action selected in the operation
   *     parameters:
   *      - in: header
   *        name: sessionId
   *        description: Customer session id (OTP)
   *        required: true
   *        schema:
   *          type: number
   *          example: 1234
   *      - in: path
   *        name: action
   *        required: true
   *        description: Action that you want to do, accept or reject the operation.
   *        schema:
   *          type: string
   *          example: "accept"
   *      - in: path
   *        name: id
   *        required: true
   *        description: Operation id.
   *        schema:
   *          type: string
   *          example: "408a6a77-2dc4-463e-8cca-02055c83a293"
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
   *                    example: "pending"
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
   *        '400':
   *           description: Invalid Request.
   *           content:
   *              application/json:
   *                schema:
   *                  type: object
   *                  properties:
   *                    message:
   *                      type: string
   */
  @Post('/:action/:id')
  public manageOperation(request: Request<{ action: Action; id: string }, {}>) {
    return OperationsService.manageOperation(request);
  }

  /**
   * @openapi
   * /operations/notify:
   *   post:
   *     tags:
   *        - "Operations"
   *     summary: Create a notification
   *     description: Create a notification for the agent in memory
   *     parameters:
   *       - in: header
   *         name: sessionId
   *         description: Customer session id (OTP)
   *         required: true
   *         schema:
   *           type: number
   *           example: 1234
   *     requestBody:
   *      required: true
   *      content:
   *        application/json:
   *          schema:
   *            $ref: "#/components/schemas/Notification"
   *          example:
   *              {
   *                message: "Test OpenAPI"
   *              }
   *     responses:
   *        '200':
   *           description: OK
   *           content:
   *              application/json:
   *                schema:
   *                  type: object
   *                  properties:
   *                    message:
   *                      type: string
   *                      example: "Notification created successfully"
   */
  @Post('/notify')
  public createNotification(request: Request<{}, {}, OperationNotification, {}>) {
    return OperationsService.createNotification(request);
  }

  /**
   * @openapi
   * /operations/notification/{id}:
   *   delete:
   *     tags:
   *      - "Operations"
   *     summary: Remove notification
   *     description: Remove the specific notification from memory
   *     parameters:
   *      - in: header
   *        name: sessionId
   *        description: Customer session id (OTP)
   *        required: true
   *        schema:
   *          type: number
   *          example: 1234
   *      - in: path
   *        name: id
   *        required: true
   *        description: Notification id.
   *        schema:
   *          type: string
   *          example: "408a6a77-2dc4-463e-8cca-02055c83a293"
   *     responses:
   *      '200':
   *        description: OK
   *        content:
   *         application/json:
   *           schema:
   *             type: object
   *             properties:
   *               message:
   *                 type: string
   *                 example: "The notification with id 408a6a77-2dc4-463e-8cca-02055c83a293 was deleted"
   *
   *      '404':
   *        description: Notification not found
   *        content:
   *         application/json:
   *           schema:
   *             type: object
   *             properties:
   *               message:
   *                 type: string
   *                 example: "The notification with id 408a6a77-2dc4-463e-8cca-02055c83a293 doesn't exist."
   */
  @Delete('/notification/:id')
  public deleteNotification(request: Request<{ id: string }, {}>) {
    return OperationsService.deleteNotification(request);
  }
}

export default OperationsRoute;
