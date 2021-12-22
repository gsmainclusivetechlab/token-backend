import { UserFacingError } from "../classes/errors";
import {
  findKeyByValueSMSOperations,
  SMSOperations,
} from "../enum/sms-operations.enum";

class SMSService {
  async processSMSMessage(body: any) {
    var smsSplitted: string[] = body.text.split(" ");

    if (smsSplitted.length === 0) {
      throw new UserFacingError("MISSING_OPERATION");
    }

    switch (smsSplitted[0]) {
      case SMSOperations.GetToken:
      case SMSOperations.DeleteToken:
      case SMSOperations.RenewToken:
        return (
          "Thanks for using USSD System - Operation: " +
          findKeyByValueSMSOperations(smsSplitted[0])
        );
      case SMSOperations.CashIn:
      case SMSOperations.CashOut:
        if (smsSplitted.length != 2) {
          throw new UserFacingError("INVALID_OPERATION");
        } else {
          return (
            "Thanks for using USSD System - Operation: " +
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
