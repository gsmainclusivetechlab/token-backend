import axios from 'axios';
import { UserFacingError } from '../classes/errors';
import { Operation } from '../interfaces/cash-in-out';
import { AccountNameReturn } from '../interfaces/mmo';
import SafeAwait from '../lib/safe-await';
import { v4 as uuidv4 } from 'uuid';

interface SendOperation {
  operations: any[];
  notifications: string[];
}
class OperationsService {
  sendOperation: SendOperation = {
    operations: [],
    notifications: [],
  };
  async getAccountInfo(token: string, amount: string, type: Operation) {
    const [accountInfoError, accountInfoData] = await SafeAwait(
      axios.get<AccountNameReturn>(
        `${process.env.ENGINE_API_URL}/operations/account-info`,
        { params: { token, amount } }
      )
    );
    if (accountInfoError) {
      throw new UserFacingError(accountInfoError);
    }
    this.setOperation(type, token, accountInfoData.data);
    return accountInfoData.data;
  }

  async startOperation(operationId: string) {
    const { token, type } = this.getOperation(operationId);
    axios.post(`${process.env.ENGINE_API_URL}/operations/${type}`, { token });
    this.sendOperation.operations.splice(
      this.sendOperation.operations.findIndex((el) => el.id === operationId),
      1
    );
    return { status: 'pending' };
  }

  async receiveOperation() {
    return this.sendOperation;
  }

  async createNotification(notification: string) {
    this.sendOperation.notifications.push(notification);
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
