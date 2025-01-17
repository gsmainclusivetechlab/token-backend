import { Request, Router } from 'express';
import Server from '../classes/server';
import { RouteHandler, Post } from '../decorators/router-handler';
import { SMSGatewayService } from '../services/sms-gateway.service';

@RouteHandler('/sms-gateway')
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
   *     summary: Send an action
   *     description: Makes a request to the SMS Gateway API to process the action present in body
   *     parameters:
   *       - in: header
   *         name: sessionId
   *         description: Customer session id (OTP)
   *         required: true
   *         schema:
   *           type: number
   *           example: 1234
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
   *                example: "GET TOKEN"
   *              system:
   *                type: string
   *                description: System used.
   *                example: "mock"
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
   */
  @Post('/send')
  public sendSMSGateway(request: Request) {
    return SMSGatewayService.processSend(request);
  }

  /**
   * @openapi
   * /sms-gateway/receive:
   *   post:
   *     tags:
   *        - "SMS-Gateway"
   *     summary: Receive messages
   *     description: Receive a message from SMS Gateway API and store it in memory
   *     parameters:
   *       - in: header
   *         name: sessionId
   *         description: Customer session id (OTP)
   *         required: true
   *         schema:
   *           type: number
   *           example: 1234
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
   *           content:
   *            application/json:
   *              schema:
   *                type: object
   *                properties:
   *                  message:
   *                    type: string
   *                    example: "Message sent."
   *
   */
  @Post('/receive')
  public receiveSMSGateway(request: Request) {
    return SMSGatewayService.processReceive(request);
  }
}

export default SMSGatewayRoute;
