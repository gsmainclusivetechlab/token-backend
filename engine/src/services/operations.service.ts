import axios from 'axios';
import { Operation, AgentCashInOutBody } from '../../interfaces/cash-in-out';
import { NotFoundError, UserFacingError } from '../classes/errors';
import { AccountNameReturn } from '../interfaces/mmo';
import { TokenDecodeInfo } from '../interfaces/token';
import GetTypeFromOperation from '../lib/operations';
import SafeAwait from '../lib/safe-await';

class OperationsService {
  async getAccountInfo(token: string, amount: string) {
    const [tokenError, tokenData] = await SafeAwait(
      axios.get<TokenDecodeInfo>(
        `${process.env.TOKEN_API_URL}/tokens/decode/${token}`
      )
    );
    if (tokenError) {
      throw new UserFacingError(tokenError.error);
    }
    const [mmoError, mmoData] = await SafeAwait(
      axios.get<AccountNameReturn>(
        `${process.env.MMO_API_URL}/accounts/msisdn/${tokenData.data.phoneNumber}/accountname`
      )
    );
    if (mmoError) {
      throw new NotFoundError(mmoError.response.data.error);
    }
    return {...mmoData.data, amount};
  }

  async startOperation(operation: Operation, token: string, amount: string) {
    const headers = {
      'X-Callback-URL': `${process.env.ENGINE_API_URL}/hooks/mmo`,
    };
    axios.get(
      `${process.env.MMO_API_URL}/transactions/type/${GetTypeFromOperation(
        operation
      )}`,
      { headers }
    );
    return {status: 'pending'}
  }
}

const operationsService = new OperationsService();
export { operationsService as OperationsService };
