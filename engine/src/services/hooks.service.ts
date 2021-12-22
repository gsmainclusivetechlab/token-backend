import { Request } from "express";
import { UserFacingError } from "../classes/errors";
import { SMSService } from "./sms.service";
import { USSDService } from "./ussd.service";

class HooksService {
  async processSMSGateway(request: Request) {
    const { body } = request;

    if (!body || !body.text) {
      throw new UserFacingError("INVALID_REQUEST - Missing property text");
    }

    if (!(typeof body.text === "string" || body.text instanceof String)) {
      throw new UserFacingError(
        "INVALID_REQUEST - Property text needs to be a string"
      );
    }

    var message: string = body.text.trim();
    if (USSDService.checkIfIsUSSDMessage(message)) {
      return USSDService.processUSSDMessage(message);
    } else {
      return SMSService.processSMSMessage(body);
    }
  }

  async processUSSDGateway(request: Request) {
    const { body } = request;

    if (!body || !body.text) {
      throw new UserFacingError("INVALID_REQUEST - Missing property text");
    }

    if (!(typeof body.text === "string" || body.text instanceof String)) {
      throw new UserFacingError(
        "INVALID_REQUEST - Property text needs to be a string"
      );
    }

    var message: string = body.text.trim();
    if (USSDService.checkIfIsUSSDMessage(message)) {
      return USSDService.processUSSDMessage(message);
    } else {
      return SMSService.processSMSMessage(message);
    }
  }

  async processMMO(request: Request) {
    return "Thanks for using Engine API";
  }
}

const hooksService = new HooksService();
export { hooksService as HooksService };
