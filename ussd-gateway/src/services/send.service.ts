import { Request } from "express";
import { UssdMenu } from "./ussd.service";

class SendService {
  async processSend(request: Request) {
    const { body } = request;

    const args = {
      phoneNumber: body.phoneNumber, //the end user's phone Number
      sessionId: body.sessionId,
      serviceCode: body.serviceCode, //the USSD code registered with your serviceCode
      //Operator: req.body.networkCode || req.body.Operator, //the end user's network Operator
      text: body.text,
    };

    return await UssdMenu.run(args);
  }
}

const sendService = new SendService();
export { sendService as SendService };
