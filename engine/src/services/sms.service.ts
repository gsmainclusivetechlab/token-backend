import axios, {AxiosError} from "axios";
import { response } from "express";
import { UserFacingError } from "../classes/errors";
import {
  findKeyByValueSMSOperations,
  SMSOperations,
} from "../enum/sms-operations.enum";
import { LogLevels, logService } from "./log.service";

class SMSService {
  async processSMSMessage(body: any) {
    var smsSplitted: string[] = body.text.split(" ");

    if (smsSplitted.length === 0) {
      throw new UserFacingError("MISSING_OPERATION");
    }

    switch (smsSplitted[0]) {
      case SMSOperations.GetToken:
        try {
          //TODO Call MMO API
          const generateTokenResponse = await axios.get(
            process.env.TOKEN_API_URL + "/tokens/generate/" + body.phoneNumber
          );

          if(generateTokenResponse.data && generateTokenResponse.data.token){
            const message = "Your token is " + generateTokenResponse.data.token;
            await axios.post(
              process.env.SMS_GATEWAY_API_URL + "/receive", { message: message }
            );
          }

          return "Thanks for using Engine API";
        } catch (err: any | AxiosError) {
          if (axios.isAxiosError(err) && err.response) {
            logService.log(LogLevels.ERROR, err.response?.data?.error);
            throw new UserFacingError(
              "OPERATION_ERROR - " + err.response?.data?.error
            );
          } else {
            logService.log(LogLevels.ERROR, err.message);
            throw new UserFacingError(
              "OPERATION_ERROR - " + err.message
            );
          }
        }
      case SMSOperations.DeleteToken:
      case SMSOperations.RenewToken:
        return (
          "Thanks for using SMS System - Operation: " +
          findKeyByValueSMSOperations(smsSplitted[0])
        );
      case SMSOperations.CashIn:
      case SMSOperations.CashOut:
        if (smsSplitted.length != 2) {
          throw new UserFacingError("INVALID_OPERATION");
        } else {
          return (
            "Thanks for using SMS System - Operation: " +
            findKeyByValueSMSOperations(smsSplitted[0]) +
            " + Amount: " +
            smsSplitted[1]
          );
        }
      default:
        throw new UserFacingError("INVALID_OPERATION");
    }
  }
}

const smsService = new SMSService();
export { smsService as SMSService };
