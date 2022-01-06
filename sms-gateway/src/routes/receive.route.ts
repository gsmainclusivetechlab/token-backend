import { Request, Router } from "express";
import Server from "../classes/server";
import { RouteHandler, Post } from "../decorators/router-handler";
import { ReceiveService } from "../services/receive.service";

@RouteHandler("/receive")
class ReceiveRoute {
  // Services Injection
  public router: Router;

  constructor(public app: Server) {}

  /**
   * @openapi
   * /receive:
   *   post:
   *     tags:
   *        - "Receive"
   *     summary: Receive messages
   *     description: Receive a message from the Engine API and send it to Proxy API
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
   *              system:
   *                type: string
   *                description: System used.
   *                example: "mock"
   *     responses:
   *        '200':
   *           description: OK
   *
   */
  @Post("/")
  public receive(request: Request) {
    return ReceiveService.processReceive(request);
  }
}

export default ReceiveRoute;
