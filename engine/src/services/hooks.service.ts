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
    const { type, system } = request.body;

    const operation: Operation = GetOperationFromType(type);

    if (!operation) {
      throw new UserFacingError("Invalid Operation");
    }

    if (!(system === "mock" || system === "live")) {
      throw new UserFacingError("Invalid System");
    }

    const notification = `The operation of ${operation} was successful`;
    //Agent Notification
    axios.post(`${process.env.PROXY_API_URL}/operations/notify`, {
      notification,
    });
    //Customer Notification
    axios.post(process.env.SMS_GATEWAY_API_URL + "/receive", {
      message: notification,
      system,
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

    if (!body.system) {
      throw new UserFacingError("INVALID_REQUEST - Missing property system");
    }

    if (!(body.system !== "mock" || body.system !== "live")) {
      throw new UserFacingError(
        "INVALID_REQUEST - Property system with wrong value"
      );
    }
  }
}

const hooksService = new HooksService();
export { hooksService as HooksService };
