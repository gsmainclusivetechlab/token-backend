import axios, { AxiosError } from 'axios';
import { catchError } from '../utils/catch-error';
import { TransactionStatus } from '../interfaces/mmo';
import { Request } from 'express';
import { HooksService } from './hooks.service';
import { GetOperationFromType } from '../lib/operations';
import { OperationType } from '../interfaces/operation';
import { NotFoundError } from '../classes/errors';
import { headersValidation } from '../utils/request-validation';

class TransactionsService {
  async getTransaction(phoneNumber: string, status: TransactionStatus, otp: string) {
    try {
      const response = await axios.get(`${process.env.MMO_API_URL}/transactions/${phoneNumber}/${status}`, {
        headers: { sessionId: otp },
      });
      return { ...response.data };
    } catch (err: any | AxiosError) {
      catchError(err);
    }
  }

  async deleteTransactionById(id: string) {
    try {
      const response = await axios.delete(`${process.env.MMO_API_URL}/transactions/${id}`);
      return { ...response.data };
    } catch (err: any | AxiosError) {
      catchError(err);
    }
  }

  async deletePendingTransaction(transaction: any, otp: number) {
    try {
      if (transaction) {
        await this.deleteTransactionById(transaction.id);
        if (transaction.createdBy !== 'customer') {
          const operationType: OperationType = GetOperationFromType(transaction.type);

          var identifier = null;
          if (transaction.identifierType === 'token') {
            const tokenApiResponse = await axios.get(`${process.env.TOKEN_API_URL}/tokens/${transaction.phoneNumber}`);
            identifier = tokenApiResponse.data.token;
          } else {
            identifier = transaction.phoneNumber;
          }

          const message = `The ${operationType} operation with value ${transaction.amount} for the customer with the identifier ${identifier} was rejected by the Customer`;
          HooksService.sendAgentMerchantNotification(message, otp);
        }
      }
    } catch (err: any | AxiosError) {
      catchError(err);
    }
  }

  async getAndDeletePendingTransaction(request: Request) {
    try {
      const { params, headers } = request;
      headersValidation(headers);
      const otp = headers['sessionid'] as string;
      const { phoneNumber } = params;
      const pendingTransaction = await this.getTransaction(phoneNumber, 'pending', otp);

      if (pendingTransaction.transaction) {
        await this.deletePendingTransaction(pendingTransaction.transaction, parseInt(otp));
      } else {
        throw new NotFoundError(`The transaction with id ${pendingTransaction.transaction.id} doesn't exist`);
      }

      return { message: `The transaction with id ${pendingTransaction.transaction.id} was deleted` };
    } catch (err: any | AxiosError) {
      catchError(err);
    }
  }
}

const transactionsService = new TransactionsService();
export { transactionsService as TransactionsService };
