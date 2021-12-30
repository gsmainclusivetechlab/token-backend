import axios from 'axios';
import { UserFacingError } from '../classes/errors';
import { AgentCashInOutBody, Operation } from '../interfaces/cash-in-out';
import { AccountNameReturn } from '../interfaces/mmo';
import SafeAwait from '../lib/safe-await';

class OperationsService {
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
    return accountInfoData.data;
  }

  async startOperation(operation: Operation, token: string, amount: string) {
    axios.get(`${process.env.ENGINE_API_URL}/operations/${operation}`, {
      params: { token },
    });
    return { status: 'pending' };
  }
}

const operationsService = new OperationsService();
export { operationsService as OperationsService };
