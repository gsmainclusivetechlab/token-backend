import { Request, Router } from 'express';
import { HooksService } from '../services/hooks.service';
import Server from '../classes/server';
import { RouteHandler, Post, Put } from '../decorators/router-handler';
import { MMOWebhookBody, SMSWebhookBody, USSDWebhookBody } from '../interfaces/hook';

@RouteHandler('/hooks')
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
   *     parameters:
   *       - in: header
   *         name: sessionId
   *         description: Customer session id (OTP)
   *         required: false
   *         schema:
   *           type: number
   *           example: 1234
   *     requestBody:
   *      required: true
   *      content:
   *        application/json:
   *          schema:
   *            $ref: "#/components/schemas/SMSWebhookBody"
   *          example:
   *            {
   *              phoneNumber: "+233207212676",
   *              text: "CASH IN 200",
   *              system: "mock"
   *            }
   *
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
   *                    example: "Thanks for using Engine API"
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
   * components:
   *  schemas:
   *    SMSWebhookBody:
   *      type: object
   *      properties:
   *        phoneNumber:
   *          type: string
   *          description: Customer's phone number.
   *        text:
   *          type: string
   *          description: Action to be done.
   *        system:
   *          type: string
   *          description: System used.
   */
  @Post('/sms-gateway')
  public smsGatewayWebhooks(request: Request<{}, {}, SMSWebhookBody, {}>) {
    return HooksService.processSMSGateway(request);
  }

  /**
   * @openapi
   * /hooks/ussd-gateway:
   *   post:
   *     tags:
   *        - "Hooks"
   *     summary: USSD gateway Webhook
   *     description: Webhook for the USSD gateway. Process the content of the USSD and takes action accordingly.
   *     parameters:
   *       - in: header
   *         name: sessionId
   *         description: Customer session id (OTP)
   *         required: false
   *         schema:
   *           type: number
   *           example: 1234
   *     requestBody:
   *      required: true
   *      content:
   *        application/json:
   *          schema:
   *            $ref: "#/components/schemas/USSDWebhookBody"
   *          example:
   *            {
   *              phoneNumber: "+233207212676",
   *              text: "1",
   *              system: "mock"
   *            }
   *
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
   *                    example: "Thanks for using Engine API"
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
   * components:
   *  schemas:
   *    USSDWebhookBody:
   *      type: object
   *      properties:
   *        phoneNumber:
   *          type: string
   *          description: Customer's phone number.
   *        text:
   *          type: string
   *          description: Action to be done.
   *        system:
   *          type: string
   *          description: System used.
   */
  @Post('/ussd-gateway')
  public ussdGatewayWebhooks(request: Request<{}, {}, USSDWebhookBody, {}>) {
    return HooksService.processUSSDGateway(request);
  }

  /**
   * @openapi
   * /hooks/mmo:
   *   put:
   *     tags:
   *        - "Hooks"
   *     summary: MMO API Webhook
   *     description: Webhook for the MMO API. After the MMO API completes a request it will trigger this endpoint.
   *                  This will send notifications to agent and user.
   *     requestBody:
   *      required: true
   *      content:
   *        application/json:
   *          schema:
   *            $ref: "#/components/schemas/MMOWebhookBody"
   *          example:
   *            {
   *              type: "cash-in",
   *              system: "mock",
   *              phoneNumber: "+233207212676",
   *              amount: 100,
   *              identifierType: "phoneNumber",
   *              otp: 1234,
   *              merchantCode: 4321,
   *              createdBy: "agent",
   *              createdUsing: "SMS"
   *            }
   *
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
   *                    example: "Thanks for using Engine API"
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
   *  schemas:
   *    MMOWebhookBody:
   *      type: object
   *      properties:
   *        type:
   *          type: string
   *          description: "Type of operation. Value can be 'cash-in', 'cash-out' or 'merchant-payment'"
   *        system:
   *          type: string
   *          description: "System that is used. Value can be 'live' or 'mock'"
   *        phoneNumber:
   *          type: string
   *          description: "Customer phone number"
   *        amount:
   *          type: number
   *          description: "Value associated with the operation"
   *        identifierType:
   *          type: string
   *          description: "Identify what is the identifier. Value can be 'token' or 'phoneNumber'"
   *        otp:
   *          type: number
   *          description: "Customer one time password"
   *        createdBy:
   *          type: string
   *          description: "Who create the operation. Value can be 'customer', 'agent' or 'merchant'"
   *        createdUsing:
   *          type: string
   *          description: "Which mode was used to create the operation. Value can be 'SMS' or 'USSD'"
   *        merchantCode:
   *          type: string
   *          description: "Merchant Code"
   */
  @Put('/mmo')
  public mmoWebhooks(request: Request<{}, {}, MMOWebhookBody, {}>) {
    return HooksService.processMMO(request.body);
  }
}

export default HooksRoute;
