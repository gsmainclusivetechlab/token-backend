import { Request, Router } from "express";
import Server from "../classes/server";
import { RouteHandler, Post, Get, Delete } from "../decorators/router-handler";
import { Action, Operation } from "../interfaces/cash-in-out";
import { OperationsService } from "../services/operations.service";

@RouteHandler("/operations")
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
   *      summary: Get all operations and notifications in memory
   *      description: TODO
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
   *                          message: "Test"
   *                         }
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
   *                          token: "233207212676",
   *                          amount: "100",
   *                          type: "cash-in",
   *                          name: {
   *                            title: "Dr.",
   *                            firstName: "Jorge",
   *                            middleName: "Fernando",
   *                            lastName: "Jesus",
   *                            fullName: "Jorge Jesus",
   *                          },
   *                          lei: "AAAA0012345678901299"
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
   *        message:
   *          type: string
   *    Operation:
   *      type: object
   *      properties:
   *        id:
   *          type: string
   *        token:
   *          type: string
   *        amount:
   *          type: string
   *        type:
   *          type: string
   *        name:
   *          type: object
   *          properties:
   *            title:
   *              type: string
   *            firstName:
   *              type: string
   *            middleName:
   *              type: string
   *            lastName:
   *              type: string
   *            fullName:
   *              type: string
   *        lei:
   *          type: string
   *
   */
  @Get("/")
  public receiveOperation(
    request: Request<
      { operation: Operation },
      {},
      {},
      { token: string; amount: string }
    >
  ) {
    return OperationsService.receiveOperation();
  }

  /**
   * @openapi
   * /operations/account-info:
   *   get:
   *     tags:
   *        - "Operations"
   *     summary: Get user's account info
   *     description: Makes a request to the Engine API in order to get the user's account info, 
   *                  and if the user's account exist, the system create the operation in memory
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
   *       - in: query
   *         name: type
   *         required: true
   *         description: Operation type.
   *         schema:
   *           type: string
   *           example: "cash-in"
   */
  @Get("/account-info")
  public getAccountInfo(
    request: Request<
      {},
      {},
      {},
      { token: string; amount: string; type: Operation }
    >
  ) {
    const { token, amount, type } = request.query;
    return OperationsService.getAccountInfo(amount, token, type);
  }

  /**
   * @openapi
   * /operations/notify:
   *   post:
   *     tags:
   *        - "Operations"
   *     summary: TODO
   *     description: TODO
   *     requestBody:
   *      required: true
   *      content:
   *        application/json:
   *          schema:
   *            type: object
   *            properties:
   *              notification:
   *                type: string
   *                description: Message to send to agent.
   *                example: "Make your test"
   *     responses:
   *        '200':
   *           description: OK
   *
   */
  @Post("/notify")
  public createNotification(
    request: Request<{}, {}, { notification: string }>
  ) {
    return OperationsService.createNotification(request.body.notification);
  }

  /**
   * @openapi
   * /operations/register:
   *   post:
   *     tags:
   *        - "Operations"
   *     summary: TODO
   *     description: TODO
   *     requestBody:
   *      required: true
   *      content:
   *        application/json:
   *          schema:
   *            type: object
   *            properties:
   *              notification:
   *                type: string
   *                description: Message to send to agent.
   *                example: "Make your test"
   *     responses:
   *        '200':
   *           description: OK
   *
   */
  @Post("/register")
  public createOperation(
    request: Request<{}, {}, { token: string; amount: string; type: Operation }>
  ) {
    return OperationsService.createOperation(request.body);
  }

  /**
   * @openapi
   * /operations/{action}/{id}:
   *   post:
   *     tags:
   *      - "Operations"
   *     summary: TODO
   *     description: TODO
   *     parameters:
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
   */
  @Post("/:action/:id")
  public manageOperation(request: Request<{ action: Action; id: string }, {}>) {
    const { token, amount } = request.body;
    return OperationsService.manageOperation(
      request.params.action,
      request.params.id
    );
  }

  /**
   * @openapi
   * /operations/notification/{id}:
   *   delete:
   *     tags:
   *      - "Operations"
   *     summary: TODO
   *     description: TODO
   *     parameters:
   *      - in: path
   *        name: id
   *        required: true
   *        description: Notification id.
   *        schema:
   *          type: string
   *          example: "408a6a77-2dc4-463e-8cca-02055c83a293"
   */
  @Delete("/notification/:id")
  public deleteNotification(request: Request<{ id: string }, {}>) {
    return OperationsService.deleteNotification(request.params.id);
  }
}

export default OperationsRoute;
