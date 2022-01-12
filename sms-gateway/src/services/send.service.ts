import axios, { AxiosError } from "axios";
import { Request } from "express";
import { UserFacingError } from "../classes/errors";
import { LogLevels, logService } from "./log.service";

class SendService {
  async processSend(request: Request) {
    try {
      const { body } = request;

      this.requestValidation(body);

      //Only for JEST
      if (body.text === "PING") {
        return "PONG";
      }

      return this.manageRequest(body);
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

  private requestValidation(body: any) {
    //Text
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

    //System
    if (!body.system || !(body.system === 'mock' || body.system === 'live')) {
      throw new UserFacingError('INVALID_REQUEST - Invalid system value');
    }

    //PhoneNumber
    if(!body.phoneNumber){
      throw new UserFacingError('INVALID_REQUEST - Missing property phoneNumber');
    }

    if (!(typeof body.phoneNumber === "string" || body.phoneNumber instanceof String)) {
      throw new UserFacingError(
        "INVALID_REQUEST - Property phoneNumber needs to be a string"
      );
    }

    if (body.phoneNumber.trim() === "") {
      throw new UserFacingError(
        "INVALID_REQUEST - Property phoneNumber can't be empty"
      );
    }
  }

  private manageRequest(body: any) {
    const ussdIdentifier = "*165#*";

    if (body.text.startsWith(ussdIdentifier)) {
      body.text = body.text.slice(ussdIdentifier.length);
      return this.sendAxiosPost(
        `${process.env.ENGINE_API_URL}/hooks/ussd-gateway`,
        body
      );
    } else {
      return this.sendAxiosPost(
        `${process.env.ENGINE_API_URL}/hooks/sms-gateway`,
        body
      );
    }
  }

  private async sendAxiosPost(path: string, body: any) {
    const response = await axios.post(path, body);
    return response.data;
  }
}

const sendService = new SendService();
export { sendService as SendService };
