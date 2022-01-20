import { AxiosError } from "axios";
import { Request } from "express";
import { catchError } from "../utils/catch-error";

class MessageService {
  sms_message: string = "";

  async processGetSMSMessage(request: Request) {
    try {
      return { message: this.sms_message };
    } catch (err: any | AxiosError) {
      catchError(err);
    }
  }

  setSMSMessage(message: string) {
    this.sms_message = message;
  }
}

const messageService = new MessageService();
export { messageService as MessageService };
