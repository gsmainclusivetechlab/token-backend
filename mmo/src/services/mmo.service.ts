import axios from 'axios';
import { NotFoundError, UnauthorizedError, UserFacingError } from '../classes/errors';
import { AccountNameError } from '../interfaces/account-name';
import {
  TransactionsRes,
  TransactionsBody,
  TransactionType,
  Transaction,
  TransactionStatus,
} from '../interfaces/transaction';
import { v4 as uuidv4 } from 'uuid';
class MmoService {
  transactions: Transaction[] = [];
  async getAccountName(phoneNumber: string): Promise<{} | AccountNameError> {
    return {
      name: {
        title: 'Dr.',
        firstName: 'Ruizao',
        middleName: 'P.',
        lastName: 'Escobar',
        fullName: 'Rui',
      },
      lei: 'AAAA0012345678901299',
    };
    // if (phoneNumber === '+233207212676') {
    // } else {
    //   throw new NotFoundError('Account does not exist');
    // }
  }

  async startTransaction(
    type: TransactionType,
    callbackUrl: string,
    body: TransactionsBody
  ): Promise<TransactionsRes> {
    const phoneNumber = body.creditParty[0].value;
    if (this.findTransactionByStatus('pending', phoneNumber)) {
      throw new UserFacingError(
        'There is a pending transaction for this customer'
      );
    }
    const transactionId = uuidv4();
    this.transactions.push({
      callbackUrl,
      type,
      phoneNumber: body.creditParty[0].value,
      id: uuidv4(),
      system: body.system,
      status: 'pending',
      amount: body.amount
    });
    // switch (type) {
    //   case 'withdrawal':
    //     try {
    //       await axios.put(callbackUrl, {
    //         amount: body.amount,
    //         type,
    //         phoneNumber: body.creditParty[0].value,
    //       });
    //     } catch (error) {
    //       throw new UserFacingError(error as string);
    //     }
    //     break;
    //   case 'deposit':
    //     try {
    //       await axios.put(callbackUrl, {
    //         amount: body.amount,
    //         type,
    //         phoneNumber: body.creditParty[0].value,
    //       });
    //     } catch (error) {
    //       throw new UserFacingError(error as string);
    //     }
    //     break;
    //   default:
    //     throw new UserFacingError('Invalid operation');
    // }
    return {
      serverCorrelationId: transactionId,
      status: 'pending',
      notificationMethod: 'polling',
      objectReference: '20256',
      pollLimit: 100,
    };
  }

  async authorizeUser(pin: string, phoneNumber: string) {
    if (pin !== '1234') {
      this.transactions.splice(this.findTransactionByStatusIndex('pending', phoneNumber), 1);
      throw new UnauthorizedError('Invalid PIN');
    }
    const transaction = this.findTransactionByStatus('pending', phoneNumber);
    if (!transaction) {
      throw new UserFacingError(`This transaction doesn't exit`);
    }
    transaction.status = 'accepted';
    try {
      await axios.put(transaction.callbackUrl, {
        amount: transaction.amount,
        type: transaction.type,
        system: transaction.system,
        phoneNumber: transaction.phoneNumber,
      });
    } catch (error) {
      throw new UserFacingError(error as string);
    }
    return transaction;
  }

  private findTransactionByStatus(
    status: TransactionStatus,
    phoneNumber: string
  ) {
    return this.transactions.find(
      (transaction) =>
        transaction.status === status && transaction.phoneNumber === phoneNumber
    );
  }

  private findTransactionByStatusIndex(
    status: TransactionStatus,
    phoneNumber: string
  ) {
    return this.transactions.findIndex(
      (transaction) =>
        transaction.status === status && transaction.phoneNumber === phoneNumber
    );
  }
}
const mmoService = new MmoService();
export { mmoService };
