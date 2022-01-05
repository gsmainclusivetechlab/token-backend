import { Request, Router } from "express";
import Server from "../classes/server";
import { RouteHandler, Post } from "../decorators/router-handler";
import { SMSGatewayService } from "../services/sms-gateway.service";

@RouteHandler("/sms-gateway")
class SMSGatewayRoute {
  // Services Injection
  public router: Router;

  constructor(public app: Server) {}

  /**
   * @openapi
   * /sms-gateway/send:
   *   post:
   *     tags:
   *        - "SMS-Gateway"
   *     summary: TODO
   *     description: TODO
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
   *              text:
   *                type: string
   *                description: Action to be done.
   *                example: "GET_TOKEN"
   *     responses:
   *        '200':
   *           description: OK
   *           content:
   *             application/json:
   *               example: "Thanks for using Engine API"
   *
   */
  @Post("/send")
  public sendSMSGateway(request: Request) {
    return SMSGatewayService.processSend(request);
  }

  /**
   * @openapi
   * /sms-gateway/receive:
   *   post:
   *     tags:
   *        - "SMS-Gateway"
   *     summary: TODO
   *     description: TODO
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
  public receiveSMSGateway(request: Request) {
    return SMSGatewayService.processReceive(request);
  }
}

export default SMSGatewayRoute;
