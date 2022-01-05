import { Request, Router } from "express";
import Server from "../classes/server";
import { RouteHandler, Post } from "../decorators/router-handler";
import { USSDGatewayService } from "../services/ussd-gateway.service";

@RouteHandler("/ussd-gateway")
class USSDGatewayRoute {
  // Services Injection
  public router: Router;

  constructor(public app: Server) {}

  /**
   * @openapi
   * /ussd-gateway/send:
   *   post:
   *     tags:
   *        - "USSD-Gateway"
   *     summary: Send an action
   *     description: Makes a request to the USSD Gateway API to process the action present in body
   *     requestBody:
   *      required: true
   *      content:
   *        application/json:
   *          schema:
   *            type: object
   *            properties:
   *              phoneNumber:
   *                type: string
   *                description: Customer's phone number.
   *                example: "+233207212676"
   *                required: true
   *              serviceCode:
   *                type: string
   *                description: Dial short code.
   *                example: "*165#"
   *                required: true
   *              text:
   *                type: string
   *                description: Action to be done.
   *                example: "1"
   *                required: true
   *     responses:
   *        '200':
   *           description: OK
   *           content:
   *             application/json:
   *               example: "Thanks for using Engine API"
   *
   */
  @Post("/send")
  public sendUSSDGateway(request: Request) {
    return USSDGatewayService.processSend(request);
  }

  /**
   * @openapi
   * /ussd-gateway/receive:
   *   post:
   *     tags:
   *        - "USSD-Gateway"
   *     summary: Receive messages
   *     description: Receive the SMS Gateway message and store it in memory
   *     requestBody:
   *      required: true
   *      content:
   *        application/json:
   *          schema:
   *            type: object
   *            properties:
   *              message:
   *                type: string
   *                description: Message to send to users.
   *                example: "Your token is 233207212676"
   *     responses:
   *        '200':
   *           description: OK
   *
   */
  @Post("/receive")
  public receiveUSSDGateway(request: Request) {
    return USSDGatewayService.processReceive(request);
  }
}

export default USSDGatewayRoute;
