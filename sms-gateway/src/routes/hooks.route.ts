import { Request, Router } from "express";
import Server from "../classes/server";
import { RouteHandler, Post } from "../decorators/router-handler";
import { SendService } from "../services/send.service";
import { TwilioService } from "../services/twilio.service";

@RouteHandler("/hooks")
class HooksRoute {
  // Services Injection
  public router: Router;

  constructor(public app: Server) {}

  /**
   * @openapi
   * /hooks/twilio:
   *   post:
   *     tags:
   *        - "Hooks"
   *     summary: Send an action - exclusive endpoint for Twilio requests
   *     description: Makes a request to the Engine API to process the action present in body 
   *     requestBody:
   *      required: true
   *      content:
   *        application/json:
   *          schema:
   *            type: object
   *            $ref: "#/components/schemas/TwilioHookBody"
   *          example: {
   *            From: "+447360264774",
   *            To: "+447897022482",
   *            Body: "GET_TOKEN"
   *           }
   *          
   *     responses:
   *        '200':
   *           description: OK
   * 
   * components:
   *  schemas:
   *    TwilioHookBody:
   *      type: object
   *      properties:
   *        ToCountry:
   *          type: string
   *        ToState:
   *          type: string
   *        SmsMessageSid:
   *          type: string
   *        NumMedia:
   *          type: string
   *        ToCity:
   *          type: string
   *        FromZip:
   *          type: string
   *        SmsSid:
   *          type: string
   *        FromState:
   *          type: string
   *        SmsStatus:
   *          type: string
   *        FromCity:
   *          type: string
   *        Body:
   *          type: string
   *        FromCountry:
   *          type: string
   *        To:
   *          type: string
   *        MessagingServiceSid:
   *          type: string
   *        ToZip:
   *          type: string
   *        NumSegments:
   *          type: string
   *        MessageSid:
   *          type: string
   *        AccountSid:
   *          type: string
   *        From:
   *          type: string
   *        ApiVersion:
   *          type: string
   * 
   *
   */
  @Post("/twilio")
  public hooks(request: Request) {
    request.body = TwilioService.parseMessage(request.body);
    return SendService.processSend(request);
  }
}

export default HooksRoute;