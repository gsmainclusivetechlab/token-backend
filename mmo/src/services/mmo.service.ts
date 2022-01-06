import axios from 'axios';
import { NotFoundError, UserFacingError } from '../classes/errors';
import { AccountNameError } from '../interfaces/account-name';
import {
  TransactionsRes,
  TransactionsBody,
  TransactionType,
} from '../interfaces/transaction';
class MmoService {
  async getAccountName(phoneNumber: string): Promise<{} | AccountNameError> {
    if (phoneNumber === '+233207212676') {
      return {
        name: {
          title: 'Dr.',
          firstName: "Ruizao",
          middleName: 'P.',
          lastName: "Escobar",
          fullName: "Rui",
        },
        lei: 'AAAA0012345678901299'
      }
    } else {
      throw new NotFoundError('Account does not exist');
    }
  }

  async startTransaction(
    type: TransactionType,
    callbackUrl: string,
    body: TransactionsBody
  ): Promise<TransactionsRes> {
    switch (type) {
      case 'withdrawal':
        try {
          await axios.put(callbackUrl, {amount: body.amount, type, phoneNumber: body.creditParty[0].value, system: body.system});
        } catch (error) {
          throw new UserFacingError(error as string);
        }
        break;
      case 'deposit':
        try {
          await axios.put(callbackUrl, {amount: body.amount, type, phoneNumber: body.creditParty[0].value, system: body.system});
        } catch (error) {
          throw new UserFacingError(error as string);
        }
        break;
      default:
        throw new UserFacingError('Invalid operation');
    }
    return {
      serverCorrelationId: '10d9d96c-b477-4d98-9d54-5fa7bd6ca532',
      status: 'pending',
      notificationMethod: 'polling',
      objectReference: '20256',
      pollLimit: 100,
    };
  }
}
const mmoService = new MmoService();
export { mmoService };
