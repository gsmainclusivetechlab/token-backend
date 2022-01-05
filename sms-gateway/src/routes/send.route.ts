import { Request, Router } from "express";
import Server from "../classes/server";
import { RouteHandler, Post } from "../decorators/router-handler";
import { SendService } from "../services/send.service";

@RouteHandler("/send")
class SendRoute {
  // Services Injection
  public router: Router;

  constructor(public app: Server) {}

  /**
   * @openapi
   * /send:
   *   post:
   *     tags:
   *        - "Send"
   *     summary: Send an action
   *     description: Makes a request to the Engine API to process the action present in body
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
  @Post("/")
  public send(request: Request) {
    return SendService.processSend(request);
  }
}

export default SendRoute;
