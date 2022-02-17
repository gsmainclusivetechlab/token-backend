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
            createdBy: body.createdBy,
            createdUsing: body.createdUsing
          });
        } else {
          throw new NotFoundError('A Merchant with this code does not exist.');
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
          createdBy: body.createdBy,
          createdUsing: body.createdUsing
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

    const transaction = this.findTransactionByStatus('pending', phoneNumber, otp);
    if (!transaction) {
      throw new NotFoundError(`Doesn't exist any pending transaction for this phone number`);
    }

    const transactionIndex = this.findIndexTransactionByStatus('pending', phoneNumber, otp);

    if (pin !== '1234') {
      this.transactions.splice(transactionIndex, 1);
      throw new UnauthorizedError('Invalid PIN');
    }

    try {
      await axios.put(transaction.callbackUrl, {
        amount: transaction.amount,
        type: transaction.type,
        system: transaction.system,
        phoneNumber: transaction.phoneNumber,
        identifierType: transaction.identifierType,
        otp: transaction.otp,
        createdBy: transaction.createdBy,
        createdUsing: transaction.createdUsing,
        merchantCode: transaction.merchant?.code
      });
    } catch (error) {
      throw new UserFacingError(error as string);
    }
    this.transactions.splice(transactionIndex, 1);
    return transaction;
  }

  async getTransaction(request: Request) {
    const { headers, params } = request;
    headersValidation(headers);

    const otp = parseInt(request.headers['sessionid'] as string);
    const { phoneNumber, status } = params;

    const transaction = this.findTransactionByStatus(status as TransactionStatus, phoneNumber, otp);

    return { transaction: transaction };
  }

  async deleteTransactionById(request: Request) {
    const { params } = request;
    const { id } = params;
    const transactionIndex = this.findTransactionByIdIndex(id);

    if (transactionIndex != -1) {
      this.transactions.splice(transactionIndex, 1);
      return { message: `The transaction with id ${id} was deleted` };
    } else {
      throw new NotFoundError(`The transaction with id ${id} doesn't exist`);
    }
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

  private findIndexTransactionByStatus(status: TransactionStatus, phoneNumber: string, otp: number) {
    return this.transactions.findIndex(
      (transaction) => transaction.status === status && transaction.phoneNumber === phoneNumber && transaction.otp === otp
    );
  }

  private findTransactionByIdIndex(id: string) {
    return this.transactions.findIndex((transaction) => transaction.id === id);
  }
}
const mmoService = new MmoService();
export { mmoService as MmoService };
