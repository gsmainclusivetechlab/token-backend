import * as axios from 'axios'
import { NotFoundError, UserFacingError } from '../classes/errors';
import { AccountNameError } from '../interfaces/account-name';
import { TransactionType } from '../interfaces/transaction';
class MmoService {
  async getAccountName(phoneNumber: string): Promise<{} | AccountNameError> {
    if (phoneNumber === '+233207212676') {
      return {};
    } else {
      throw new NotFoundError('Account does not exist');
    }
  }

  async startTransaction(type: TransactionType) {
    switch (type) {
      case 'withdrawal':
        axios.default
        break;
      case 'deposit':
        break;

      default:
        throw new UserFacingError('Invalid operation');
        break;
    }
  }
}
const mmoService = new MmoService();
export { mmoService };
