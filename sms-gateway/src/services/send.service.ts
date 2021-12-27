import axios, { AxiosError } from "axios";
import { Request } from "express";
import { UserFacingError } from "../classes/errors";
import { LogLevels, logService } from "./log.service";

class SendService {
  async processSend(request: Request) {
    try {
      const { body } = request;

      if(body.text === "PING"){
        return "PONG";
      }

      const response = await axios.post(
        process.env.WEB_HOOK_URL + "/hooks/sms-gateway",
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
}

const sendService = new SendService();
export { sendService as SendService };
