import axios, { AxiosError } from "axios";
import { UserFacingError } from "../classes/errors";
import { USSDOperations } from "../enum/ussd-operations.enum";
import { LogLevels, logService } from "./log.service";
import { OperationsService } from "./operations.service";

class USSDService {
  async processUSSDMessage(body: any) {
    var message: string = body.text.trim();

    if (message.length === 0) {
      throw new UserFacingError("MISSING_OPERATION");
    }

    var ussdSplitted: string[] = message.split("*");

    let tokenApiResponse = null;

    try {
      switch (ussdSplitted[0]) {
        case USSDOperations.GetToken:
          tokenApiResponse = await axios.get(
            process.env.TOKEN_API_URL + "/tokens/renew/" + body.phoneNumber
          );

          if (tokenApiResponse.data && tokenApiResponse.data.token) {
            const message = "Your token is " + tokenApiResponse.data.token;
            await axios.post(process.env.SMS_GATEWAY_API_URL + "/receive", {
              message: message,
              system: body.system,
              phoneNumber: body.phoneNumber
            });
          }

          return "Thanks for using Engine API";
        case USSDOperations.DeleteToken:
          tokenApiResponse = await axios.get(
            process.env.TOKEN_API_URL + "/tokens/invalidate/" + body.phoneNumber
          );

          if (tokenApiResponse.data && tokenApiResponse.data) {
            const message = "Your token was deleted";
            await axios.post(process.env.SMS_GATEWAY_API_URL + "/receive", {
              message: message,
              system: body.system,
              phoneNumber: body.phoneNumber
            });
          }

          return "Thanks for using Engine API";
        case USSDOperations.CashIn:
          if(!ussdSplitted[1]){
            throw new UserFacingError("Missing amount"); 
          }

          tokenApiResponse = await axios.get(
            process.env.TOKEN_API_URL + "/tokens/" + body.phoneNumber
          );
          // const cashInAccountInfo = await OperationsService.getAccountInfo(
          //   ussdSplitted[1],
          //   undefined,
          //   body.phoneNumber
          // );
          // await axios.post(`${process.env.PROXY_API_URL}/operations/register`, {
          //   token: tokenApiResponse.data.token,
          //   amount: ussdSplitted[1],
          //   type: "cash-in",
          //   ...cashInAccountInfo,
          //   system: body.system,
          // });
          return "Thanks for using Engine API";
        case USSDOperations.CashOut:
          if(!ussdSplitted[1]){
            throw new UserFacingError("Missing amount"); 
          }

          tokenApiResponse = await axios.get(
            process.env.TOKEN_API_URL + "/tokens/" + body.phoneNumber
          );
          // const cashOutAccountInfo = await OperationsService.getAccountInfo(
          //   ussdSplitted[1],
          //   undefined,
          //   body.phoneNumber
          // );
          // await axios.post(`${process.env.PROXY_API_URL}/operations/register`, {
          //   token: tokenApiResponse.data.token,
          //   type: "cash-out",
          //   ...cashOutAccountInfo,
          //   system: body.system,
          // });
          return "Thanks for using Engine API";
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
