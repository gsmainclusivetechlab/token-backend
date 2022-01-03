import axios, { AxiosError } from "axios";
import { UserFacingError } from "../classes/errors";
import {
  findKeyByValueUSSDOperations,
  USSDOperations,
} from "../enum/ussd-operations.enum";
import { LogLevels, logService } from "./log.service";
import { OperationsService } from "./operations.service";

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
          tokenApiResponse = await axios.get(
            process.env.TOKEN_API_URL + '/tokens/' + body.phoneNumber
          );
          await OperationsService.getAccountInfo(
            ussdSplitted[1],
            undefined,
            body.phoneNumber
          );
          await axios.post(`${process.env.PROXY_API_URL}/operations/register`, {
            token: tokenApiResponse.data,
            amount: ussdSplitted[1],
            type: 'cash-in',
          });
        case USSDOperations.CashOut:
          tokenApiResponse = await axios.get(
            process.env.TOKEN_API_URL + '/tokens/' + body.phoneNumber
          );
          await OperationsService.getAccountInfo(
            ussdSplitted[1],
            undefined,
            body.phoneNumber
          );
          await axios.post(`${process.env.PROXY_API_URL}/operations/register`, {
            token: tokenApiResponse.data,
            amount: ussdSplitted[1],
            type: 'cash-out',
          });
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
