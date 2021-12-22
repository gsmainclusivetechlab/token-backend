import { UserFacingError } from "../classes/errors";
import {
  findKeyByValueUSSDOperations,
  USSDOperations,
} from "../enum/ussd-operations.enum";

class USSDService {
  checkIfIsUSSDMessage(message: string): boolean {
    return message.startsWith("*") && message.endsWith("#");
  }
  
  processUSSDMessage(message: string) {
    //Removing the first * and the end #
    var cleanMessage = message.slice(1, -1);

    if (cleanMessage.length === 0) {
      throw new UserFacingError("MISSING_OPERATION");
    }

    var ussdSplitted: string[] = cleanMessage.split("*");

    switch (ussdSplitted[0]) {
      case USSDOperations.GetToken:
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
