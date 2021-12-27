import axios, { AxiosError } from "axios";
import { Request } from "express";
import { UserFacingError } from "../classes/errors";
import { LogLevels, logService } from "./log.service";
import { MessageService } from "./message.service";

class USSDGatewayService {
  async processSend(request: Request) {
    try {
      const { body } = request;

      MessageService.setUSSDMessage("");

      const response = await axios.post(
        process.env.USSD_GATEWAY_API_URL + "/send",
        body
      );

      return response.data;
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

  async processReceive(request: Request) {
    try {
        const { body } = request;
        MessageService.setUSSDMessage(body.message);
        return;
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

const ussdGatewayService = new USSDGatewayService();
export { ussdGatewayService as USSDGatewayService };
