import axios, { AxiosError } from "axios";
import { UserFacingError } from "../classes/errors";
import {
  findKeyByValueUSSDOperations,
  USSDOperations,
} from "../enum/ussd-operations.enum";
import { LogLevels, logService } from "./log.service";

class USSDService {
  checkIfIsUSSDMessage(body: any): boolean {
    var message: string = body.text.trim();
    return message.startsWith("*") && message.endsWith("#");
  }

  async processUSSDMessage(body: any) {
    var message: string = body.text.trim();
    //Removing the first * and the end #
    //var cleanMessage = message.slice(1, -1);
    var cleanMessage = message;

    if (cleanMessage.length === 0) {
      throw new UserFacingError("MISSING_OPERATION");
    }

    var ussdSplitted: string[] = cleanMessage.split("*");

    let tokenApiResponse = null;

    try {
      switch (ussdSplitted[0]) {
        case USSDOperations.GetToken:
          //TODO Call MMO API
          tokenApiResponse = await axios.get(
            process.env.TOKEN_API_URL + "/tokens/" + body.phoneNumber
          );

          if (tokenApiResponse.data && tokenApiResponse.data.token) {
            const message = "Your token is " + tokenApiResponse.data.token;
            await axios.post(process.env.USSD_GATEWAY_API_URL + "/receive", {
              message: message,
            });
          }

          return "Thanks for using Engine API";
        case USSDOperations.DeleteToken:
          //TODO Call MMO API
          tokenApiResponse = await axios.get(
            process.env.TOKEN_API_URL + "/tokens/invalidate/" + body.phoneNumber
          );

          if (tokenApiResponse.data && tokenApiResponse.data) {
            const message = "Your token was deleted";
            await axios.post(process.env.USSD_GATEWAY_API_URL + "/receive", {
              message: message,
            });
          }

          return "Thanks for using Engine API";
        case USSDOperations.RenewToken:
          //TODO Call MMO API
          tokenApiResponse = await axios.get(
            process.env.TOKEN_API_URL + "/tokens/renew/" + body.phoneNumber
          );

          if (tokenApiResponse.data && tokenApiResponse.data.token) {
            const message = "Your new token is " + tokenApiResponse.data.token;
            await axios.post(process.env.USSD_GATEWAY_API_URL + "/receive", {
              message: message,
            });
          }

          return "Thanks for using Engine API";
        case USSDOperations.CashIn:
        case USSDOperations.CashOut:
          if (ussdSplitted.length != 2) {
            throw new Error("INVALID_OPERATION");
          } else {
            return (
              "Thanks for using USSD System - Operation: " +
              findKeyByValueUSSDOperations(ussdSplitted[0]) +
              " + Amount: " +
              ussdSplitted[1]
            );
          }
        default:
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

const ussdService = new USSDService();
export { ussdService as USSDService };
