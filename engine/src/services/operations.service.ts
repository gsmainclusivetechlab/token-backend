import axios from "axios";
import { Operation, Action, System } from "../interfaces/cash-in-out";
import { NotFoundError, UserFacingError } from "../classes/errors";
import { AccountNameReturn } from "../interfaces/mmo";
import { TokenDecodeInfo } from "../interfaces/token";
import { GetTypeFromOperation } from "../lib/operations";
import SafeAwait from "../lib/safe-await";

class OperationsService {
  async getAccountInfo(amount: string, token?: string, phone?: string) {
    let phoneNumber = phone;
    if (token) {
      const [tokenError, tokenData] = await SafeAwait(
        axios.get<TokenDecodeInfo>(
          `${process.env.TOKEN_API_URL}/tokens/decode/${token}`
        )
      );
      if (tokenError) {
        throw new UserFacingError(tokenError.response.data.error);
      }
      phoneNumber = tokenData.data.phoneNumber;
    }
    const [mmoError, mmoData] = await SafeAwait(
      axios.get<AccountNameReturn>(
        `${process.env.MMO_API_URL}/accounts/msisdn/${phoneNumber}/accountname`
      )
    );
    if (mmoError) {
      throw new NotFoundError(mmoError.response.data.error);
    }
    return { ...mmoData.data, amount };
  }

  async startOperation(
    operation: Operation,
    action: Action,
    token: string,
    amount: string,
    system: System
  ) {
    if (!(action === "accept" || action === "reject")) {
      throw new UserFacingError("Invalid action");
    }

    if (!(operation === "cash-in" || operation === "cash-out")) {
      throw new UserFacingError("Invalid type");
    }

    if (!(system === "mock" || system === "live")) {
      throw new UserFacingError("Invalid System");
    }

    if (action === "accept") {
      const [tokenError, tokenData] = await SafeAwait(
        axios.get<TokenDecodeInfo>(
          `${process.env.TOKEN_API_URL}/tokens/decode/${token}`
        )
      );
      if (tokenError) {
        throw new UserFacingError(tokenError.error);
      }
      const headers = {
        "X-Callback-URL": `${process.env.ENGINE_API_URL}/hooks/mmo`,
      };
      const body = {
        amount,
        debitParty: [
          {
            key: "msisdn", // accountid
            value: tokenData.data.phoneNumber, // 2999
          },
        ],
        creditParty: [
          {
            key: "msisdn", // accountid
            value: tokenData.data.phoneNumber, // 2999
          },
        ],
        currency: "RWF", // RWF
        system,
      };
      axios.post(
        `${process.env.MMO_API_URL}/transactions/type/${GetTypeFromOperation(
          operation
        )}`,
        body,
        { headers }
      );

      axios.post(process.env.SMS_GATEWAY_API_URL + "/receive", {
        message: `Send a message with PIN <pin>`,
        system,
      });
      return { status: "pending" };
    } else {
      const notification = `The operation of ${operation} was rejected`;

      //Agent Notification
      axios.post(`${process.env.PROXY_API_URL}/operations/notify`, {
        notification,
      });
      //Customer Notification
      axios.post(process.env.SMS_GATEWAY_API_URL + "/receive", {
        message: notification,
        system,
      });

      return { status: "reject" };
    }
  }
}

const operationsService = new OperationsService();
export { operationsService as OperationsService };
