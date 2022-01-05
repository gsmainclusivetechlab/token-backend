import axios from "axios";
import { Request } from "express";
import { UserFacingError } from "../classes/errors";
import { Operation } from "../interfaces/cash-in-out";
import { GetOperationFromType } from "../lib/operations";
import { SMSService } from "./sms.service";
import { USSDService } from "./ussd.service";

class HooksService {
  async processSMSGateway(request: Request) {
    const { body } = request;

    this.validateBodyProperties(body);

    return await SMSService.processSMSMessage(body);
  }

  async processUSSDGateway(request: Request) {
    const { body } = request;

    this.validateBodyProperties(body);

    return await USSDService.processUSSDMessage(body);
  }

  processMMO(request: Request) {
    const operation: Operation = GetOperationFromType(request.body.type);
    const notification = `The operation of ${operation} was successfully`;
    axios.post(`${process.env.PROXY_API_URL}/operations/notify`, {
      notification,
    });
    return "Thanks for using Engine API";
  }

  private validateBodyProperties(body: any) {
    if (!body.phoneNumber) {
      throw new UserFacingError(
        "INVALID_REQUEST - Missing property phoneNumber"
      );
    }

    if (
      !(
        typeof body.phoneNumber === "string" ||
        body.phoneNumber instanceof String
      )
    ) {
      throw new UserFacingError(
        "INVALID_REQUEST - Property phoneNumber needs to be a string"
      );
    }

    if (body.phoneNumber.trim() === "") {
      throw new UserFacingError(
        "INVALID_REQUEST - Property phoneNumber can't be empty"
      );
    }

    if (!body.text) {
      throw new UserFacingError("INVALID_REQUEST - Missing property text");
    }

    if (!(typeof body.text === "string" || body.text instanceof String)) {
      throw new UserFacingError(
        "INVALID_REQUEST - Property text needs to be a string"
      );
    }

    if (body.text.trim() === "") {
      throw new UserFacingError(
        "INVALID_REQUEST - Property text can't be empty"
      );
    }
  }
}

const hooksService = new HooksService();
export { hooksService as HooksService };
