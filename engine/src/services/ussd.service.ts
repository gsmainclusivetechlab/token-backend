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
    var cleanMessage = message.slice(1, -1);

    if (cleanMessage.length === 0) {
      throw new UserFacingError("MISSING_OPERATION");
    }

    var ussdSplitted: string[] = cleanMessage.split("*");

    switch (ussdSplitted[0]) {
      case USSDOperations.GetToken:
        try {
          const generateTokenResponse = await axios.get(
            process.env.TOKEN_API_URL + "/tokens/generate/" + body.phoneNumber
          );
          return generateTokenResponse.data;
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
      case USSDOperations.DeleteToken:
      case USSDOperations.RenewToken:
        return (
          "Thanks for using USSD System - Operation: " +
          findKeyByValueUSSDOperations(ussdSplitted[0])
        );
      case USSDOperations.CashIn:
      case USSDOperations.CashOut:
        if (ussdSplitted.length != 2) {
          throw new UserFacingError("INVALID_OPERATION");
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
  }
}

const ussdService = new USSDService();
export { ussdService as USSDService };
