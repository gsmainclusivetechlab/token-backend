import { Request, Router } from "express";
import Server from "../classes/server";
import { RouteHandler, Get } from "../decorators/router-handler";
import { MessageService } from "../services/message.service";

@RouteHandler("/message")
class MessageRoute {
  // Services Injection
  public router: Router;

  constructor(public app: Server) {}

  /**
   * @openapi
   * /message/sms:
   *   get:
   *     tags:
   *        - "Message"
   *     summary: Get SMS Message
   *     description: Gets the message about last user operation
   *     responses:
   *        '200':
   *           description: OK
   *           content:
   *             application/json:
   *               schema:
   *                 type: object
   *                 properties:
   *                   message:
   *                     type: string
   *                     example: "Example"
   *
   */
  @Get("/sms")
  public getSMSMessage(request: Request) {
    return MessageService.processGetSMSMessage(request);
  }
}

export default MessageRoute;
