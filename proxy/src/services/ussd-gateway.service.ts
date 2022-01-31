import axios, { AxiosError } from "axios";
import { Request } from "express";
import { catchError } from "../utils/catch-error";
import { MessageService } from "./message.service";

class USSDGatewayService {
  async processSend(request: Request) {
    try {
      const { body } = request;

      //TODO
      //MessageService.setSMSMessage("");

      const response = await axios.post(
        process.env.USSD_GATEWAY_API_URL + "/send",
        body
      );

      return response.data;
    } catch (err: any | AxiosError) {
      catchError(err);
    }
  }
}

const ussdGatewayService = new USSDGatewayService();
export { ussdGatewayService as USSDGatewayService };
