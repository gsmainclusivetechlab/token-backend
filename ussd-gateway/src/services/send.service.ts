import { Request } from "express";
import { UserFacingError } from "../classes/errors";
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
      system: body.system
    };
    switch(args.serviceCode) { 
      case "*165#": { 
         return await UssdMenu.run(args);
      } 
      case "*#0#": {
         return "ACK"; 
      } 
      default: { 
        throw new UserFacingError("Invalid short code");
      } 
   }
  }
}

const sendService = new SendService();
export { sendService as SendService };
