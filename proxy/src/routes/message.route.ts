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
   *     summary: Get SMS notification
   *     description: Gets last nofitication about last user operation
   *     responses:
   *        '200':
   *           description: OK
   *           content:
   *             application/json:
   *               example:
   *                 message: ""
   *
   */
  @Get("/sms")
  public getSMSMessage(request: Request) {
    return MessageService.processGetSMSMessage(request);
  }
}

export default MessageRoute;
