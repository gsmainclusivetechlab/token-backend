import axios, { AxiosError } from "axios";
import { Request } from "express";
import { UserFacingError } from "../classes/errors";
import { LogLevels, logService } from "./log.service";

class MessageService {
  sms_message: string = "";

  async processGetSMSMessage(request: Request) {
    try {
      return { message: this.sms_message };
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

  setSMSMessage(message: string) {
    this.sms_message = message;
  }
}

const messageService = new MessageService();
export { messageService as MessageService };
