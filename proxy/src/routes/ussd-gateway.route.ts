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
   *              serviceCode:
   *                type: string
   *                description: Dial short code.
   *                example: "*165#"
   *              text:
   *                type: string
   *                description: Action to be done.
   *                example: "1"
   *              system:
   *                type: string
   *                description: System used.
   *                example: "mock"
   *
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
}

export default USSDGatewayRoute;
