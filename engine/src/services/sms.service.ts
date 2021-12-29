import axios, { AxiosError } from "axios";
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

    let tokenApiResponse = null;

    try {
      switch (smsSplitted[0]) {
        case SMSOperations.GetToken:
          //TODO Call MMO API
          tokenApiResponse = await axios.get(
            process.env.TOKEN_API_URL + "/tokens/" + body.phoneNumber
          );

          if (tokenApiResponse.data && tokenApiResponse.data.token) {
            const message = "Your token is " + tokenApiResponse.data.token;
            await axios.post(process.env.SMS_GATEWAY_API_URL + "/receive", {
              message: message,
            });
          }

          return "Thanks for using Engine API";
        case SMSOperations.DeleteToken:
          //TODO Call MMO API
          tokenApiResponse = await axios.get(
            process.env.TOKEN_API_URL + "/tokens/invalidate/" + body.phoneNumber
          );

          if (tokenApiResponse.data && tokenApiResponse.data) {
            const message = "Your token was deleted";
            await axios.post(process.env.SMS_GATEWAY_API_URL + "/receive", {
              message: message,
            });
          }

          return "Thanks for using Engine API";
        case SMSOperations.RenewToken:
          //TODO Call MMO API
          tokenApiResponse = await axios.get(
            process.env.TOKEN_API_URL + "/tokens/renew/" + body.phoneNumber
          );

          if (tokenApiResponse.data && tokenApiResponse.data.token) {
            const message =
              "Your new token is " + tokenApiResponse.data.token;
            await axios.post(process.env.SMS_GATEWAY_API_URL + "/receive", {
              message: message,
            });
          }

          return "Thanks for using Engine API";
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
          //throw new Error("INVALID_OPERATION");
          throw new UserFacingError("INVALID_OPERATION");
      }
    } catch (err: any | AxiosError) {
      if (axios.isAxiosError(err) && err.response) {
        logService.log(LogLevels.ERROR, err.response?.data?.error);
        throw new UserFacingError(
          "OPERATION_ERROR - " + err.response?.data?.error
        );
      } else {
        logService.log(LogLevels.ERROR, err.message);
        throw new UserFacingError("OPERATION_ERROR - " + err.message);
      }
    }
  }
}

const smsService = new SMSService();
export { smsService as SMSService };
