import axios, { AxiosError } from "axios";
import { Request } from "express";
import { UserFacingError } from "../classes/errors";
import { LogLevels, logService } from "./log.service";
import { TwilioService } from "./twilio.service";

class ReceiveService {
  async processReceive(request: Request) {
    try {
      const { body } = request;

      switch (body.system) {
        case "mock":
          axios.post(process.env.PROXY_API_URL + "/sms-gateway/receive", body);
          return;
        case "live":
          TwilioService.sendMessage(body.phoneNumber, body.message)
          return;
        default:
          throw new UserFacingError("Invalid system");
      }
    } catch (err: any | AxiosError) {
      if (axios.isAxiosError(err) && err.response) {
        logService.log(LogLevels.ERROR, err.response?.data?.error);
        throw new UserFacingError(err.response?.data?.error);
      } else {
        logService.log(LogLevels.ERROR, err.message);
        throw new UserFacingError(err.message);
      }
    }
  }
}

const receiveService = new ReceiveService();
export { receiveService as ReceiveService };
