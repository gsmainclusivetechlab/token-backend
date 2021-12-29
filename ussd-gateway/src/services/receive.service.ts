import axios, { AxiosError } from "axios";
import { Request } from "express";
import { UserFacingError } from "../classes/errors";
import { LogLevels, logService } from "./log.service";

class ReceiveService {
  async processReceive(request: Request) {
    try {
      const { body } = request;

      const response = await axios.post(
        process.env.PROXY_API_URL + "/ussd-gateway/receive",
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

const receiveService = new ReceiveService();
export { receiveService as ReceiveService };
