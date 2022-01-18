import { Request, Router } from "express";
import { HooksService } from "../services/hooks.service";
import Server from "../classes/server";
import { RouteHandler, Post, Put } from "../decorators/router-handler";
import { MMOWebhookBody, SMSWebhookBody, USSDWebhookBody } from "../interfaces/hook";

@RouteHandler("/hooks")
class HooksRoute {
  // Services Injection
  public router: Router;

  constructor(public app: Server) {}

  /**
   * @openapi
   * /hooks/sms-gateway:
   *   post:
   *     tags:
   *        - "Hooks"
   *     summary: SMS gateway Webhook
   *     description: Webhook for the SMS gateway. Process the content of the SMS and takes action accordingly.
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
   *                example: CASH_IN 200
   *              system:
   *                type: string
   *                description: System used.
   *                example: "mock"
   */
  @Post("/sms-gateway")
  public smsGatewayWebhooks(request: Request<{}, {}, SMSWebhookBody, {}>) {
    return HooksService.processSMSGateway(request.body);
  }

  /**
   * @openapi
   * /hooks/ussd-gateway:
   *   post:
   *     tags:
   *        - "Hooks"
   *     summary: USSD gateway Webhook
   *     description: Webhook for the USSD gateway. Process the content of the USSD and takes action accordingly.
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
   *                example: "#165*"
   *              system:
   *                type: string
   *                description: System used.
   *                example: "mock"
   */
  @Post("/ussd-gateway")
  public ussdGatewayWebhooks(request: Request<{}, {}, USSDWebhookBody, {}>) {
    return HooksService.processUSSDGateway(request.body);
  }

  /**
   * @openapi
   * /hooks/mmo:
   *   put:
   *     tags:
   *        - "Hooks"
   *     summary: MMO API Webhook
   *     description: Webhook for the MMO API. After the MMO API completes a request it will trigger this endpoint.
   *     requestBody:
   *      required: true
   *      content:
   *        application/json:
   *          schema:
   *            type: object
   *            properties:
   *              amount:
   *                type: string
   *                description: Amount of the operation.
   *                example: 200
   *              phoneNumber:
   *                type: string
   *                description: Customer's phone number.
   *                example: "+233207212676"
   *              type:
   *                type: string
   *                description: Operation's type.
   *                example: deposit
   *              system:
   *                type: string
   *                description: System used.
   *                example: "mock"
   */
  @Put("/mmo")
  public mmoWebhooks(request: Request<{}, {}, MMOWebhookBody, {}>) {
    return HooksService.processMMO(request.body);
  }
}

export default HooksRoute;
