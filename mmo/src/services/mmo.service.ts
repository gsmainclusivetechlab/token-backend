import axios from 'axios';
import { NotFoundError, UnauthorizedError, UserFacingError } from '../classes/errors';
import { TransactionsRes, TransactionsBody, TransactionType, Transaction, TransactionStatus } from '../interfaces/transaction';
import { v4 as uuidv4 } from 'uuid';
import { AccountsService } from './accounts.service';
import { Request } from 'express';
import { headersValidation } from '../utils/request-validation';
class MmoService {
  transactions: Transaction[] = [];

  async startTransaction(type: TransactionType, callbackUrl: string, body: TransactionsBody): Promise<TransactionsRes> {
    const phoneNumber = body.creditParty[0].value;
    if (this.findTransactionByStatus('pending', phoneNumber, body.otp)) {
      throw new UserFacingError('There is a pending transaction for this customer');
    }
    const transactionId = uuidv4();

    switch (type) {
      case 'merchantpay':
        const findMerchant = AccountsService.findMerchantByCode(body.merchantCode);

        if (findMerchant) {
          this.transactions.push({
            callbackUrl,
            type,
            phoneNumber: body.creditParty[0].value,
            id: uuidv4(),
            system: body.system,
            status: 'pending',
            amount: body.amount,
            merchant: findMerchant,
            identifierType: body.identifierType,
            otp: body.otp,
          });
        } else {
          throw new NotFoundError("Doesn't exist a merchant available with this code");
        }

        break;
      default:
        this.transactions.push({
          callbackUrl,
          type,
          phoneNumber: body.creditParty[0].value,
          id: uuidv4(),
          system: body.system,
          status: 'pending',
          amount: body.amount,
          identifierType: body.identifierType,
          otp: body.otp,
        });
    }

    return {
      serverCorrelationId: transactionId,
      status: 'pending',
      notificationMethod: 'polling',
      objectReference: '20256',
      pollLimit: 100,
    };
  }

  async authorizeUser(request: Request) {
    const { body, headers } = request;
    headersValidation(headers);
    const { phoneNumber, pin } = body;
    const otp = parseInt(request.headers['sessionid'] as string); 

    const transactionIndex = this.findTransactionByStatusIndex('pending', phoneNumber, otp);

    if (pin !== '1234') {
      if (transactionIndex != -1) {
        this.transactions.splice(transactionIndex, 1);
      }

      throw new UnauthorizedError('Invalid PIN');
    }

    const transaction = this.findTransactionByStatus('pending', phoneNumber, otp);
    if (!transaction) {
      throw new NotFoundError(`Doesn't exist any pending transaction for this phone number`);
    }

    transaction.status = 'accepted';
    try {
      await axios.put(transaction.callbackUrl, {
        amount: transaction.amount,
        type: transaction.type,
        system: transaction.system,
        phoneNumber: transaction.phoneNumber,
        identifierType: transaction.identifierType,
        otp: transaction.otp,
      });
    } catch (error) {
      throw new UserFacingError(error as string);
    }
    this.transactions.splice(transactionIndex, 1);
    return transaction;
  }

  deleteTransactionsByOTP(otp: number) {
    this.transactions.forEach((item, index, object) => {
      if (item.otp === otp) {
        object.splice(index, 1);
      }
    });
  }

  private findTransactionByStatus(status: TransactionStatus, phoneNumber: string, otp: number) {
    return this.transactions.find(
      (transaction) => transaction.status === status && transaction.phoneNumber === phoneNumber && transaction.otp === otp
    );
  }

  private findTransactionByStatusIndex(status: TransactionStatus, phoneNumber: string, otp: number) {
    return this.transactions.findIndex(
      (transaction) => transaction.status === status && transaction.phoneNumber === phoneNumber && transaction.otp === otp
    );
  }
}
const mmoService = new MmoService();
export { mmoService as MmoService };
