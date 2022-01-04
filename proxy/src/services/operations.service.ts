import axios, { AxiosError } from "axios";
import { UserFacingError } from "../classes/errors";
import { Action, Operation } from "../interfaces/cash-in-out";
import { AccountNameReturn } from "../interfaces/mmo";
import SafeAwait from "../lib/safe-await";
import { v4 as uuidv4 } from "uuid";
import { LogLevels, logService } from "./log.service";
import { MessageService } from "./message.service";

interface SendOperation {
  operations: any[];
  notifications: any[];
}
class OperationsService {
  sendOperation: SendOperation = {
    operations: [],
    notifications: [],
  };
  async getAccountInfo(amount: string, token: string, type: Operation) {
    if (!(type === "cash-in" || type === "cash-out")) {
      throw new UserFacingError("Invalid type");
    }

    const [accountInfoError, accountInfoData] = await SafeAwait(
      axios.get<AccountNameReturn>(
        `${process.env.ENGINE_API_URL}/operations/account-info`,
        { params: { token, amount } }
      )
    );
    if (accountInfoError) {
      throw new UserFacingError(accountInfoError.response.data.error);
    }
    this.setOperation(type, token, accountInfoData.data);
    return accountInfoData.data;
  }

  async manageOperation(action: Action, operationId: string) {
    try {
      if (!(action === "accept" || action === "reject")) {
        throw new UserFacingError("Invalid action");
      }

      const { token, type, amount } = this.getOperation(operationId);
      if (!token) {
        throw new UserFacingError("Operation doesn't exist");
      }

      this.sendOperation.operations.splice(
        this.sendOperation.operations.findIndex((el) => el.id === operationId),
        1
      );

      const response = await axios.post(
        `${process.env.ENGINE_API_URL}/operations/${type}/${action}`,
        { token, amount }
      );
      return response.data;
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

  async receiveOperation() {
    return this.sendOperation;
  }

  async createNotification(message: string) {
    MessageService.setSMSMessage(message);
    this.sendOperation.notifications.push({
      id: uuidv4(),
      message,
    });
  }

  async createOperation(body: any) {
    this.sendOperation.operations.push({
      id: uuidv4(),
      ...body,
    });
  }

  async deleteNotification(id: string) {
    this.sendOperation.notifications.splice(
      this.sendOperation.notifications.findIndex((el) => el.id === id),
      1
    );
    return { message: `The notification with id ${id} was deleted` };
  }

  private getOperation(id: string) {
    return this.sendOperation.operations.find((el) => el.id === id);
  }

  private setOperation(operation: Operation, token: string, data: any) {
    this.sendOperation.operations.push({
      id: uuidv4(),
      type: operation,
      token,
      ...data,
    });
  }
}

const operationsService = new OperationsService();
export { operationsService as OperationsService };
