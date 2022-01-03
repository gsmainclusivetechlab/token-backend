import axios from 'axios';
import { UserFacingError } from '../classes/errors';
import { Operation } from '../interfaces/cash-in-out';
import { AccountNameReturn } from '../interfaces/mmo';
import SafeAwait from '../lib/safe-await';
import { v4 as uuidv4 } from 'uuid';

interface SendOperation {
  operations: any[]
  notifications: string[]
}
class OperationsService {
  sendOperation: SendOperation = {
    operations: [],
    notifications: []
  }
  async getAccountInfo(token: string, amount: string) {
    const [accountInfoError, accountInfoData] = await SafeAwait(
      axios.get<AccountNameReturn>(
        `${process.env.ENGINE_API_URL}/operations/account-info`,
        { params: { token, amount } }
      )
    );
    if (accountInfoError) {
      throw new UserFacingError(accountInfoError);
    }
    this.setOperation(accountInfoData.data)
    return accountInfoData.data;
  }

  async startOperation(operationId: string, operation: Operation, token: string, amount: string) {
    axios.get(`${process.env.ENGINE_API_URL}/operations/${operation}`, {
      params: { token },
    });
    this.sendOperation.operations.splice(this.sendOperation.operations.findIndex(el => el.id === operationId), 1)
    return { status: 'pending' };
  }

  async receiveOperation() {
    return this.sendOperation
  }

  private setOperation(operation: any) {
    this.sendOperation.operations.push({id: uuidv4(), ...operation})
  }
}

const operationsService = new OperationsService();
export { operationsService as OperationsService };
