import axios from 'axios';
import { NotFoundError, UnauthorizedError, UserFacingError } from '../classes/errors';
import { AccountNameReturn } from '../interfaces/account-name';
import { TransactionsRes, TransactionsBody, TransactionType, Transaction, TransactionStatus, Merchant } from '../interfaces/transaction';
import { v4 as uuidv4 } from 'uuid';
import { phone as phoneLib } from 'phone';
import { QueriesService } from './queries.service';
class MmoService {
  transactions: Transaction[] = [];
  merchants: Merchant[] = [{ code: '4321', name: 'XPTO Lda', available: true }];

  async createUserAccount(fullName: string, phoneNumber: string): Promise<AccountNameReturn> {
    if (!fullName) {
      throw new UserFacingError('INVALID_REQUEST - Missing property fullName');
    }

    if (fullName.trim() === '') {
      throw new UserFacingError("INVALID_REQUEST - Property fullName can't be empty");
    }

    if (!phoneNumber) {
      throw new UserFacingError('INVALID_REQUEST - Missing property phoneNumber');
    }

    if (phoneNumber.trim() === '') {
      throw new UserFacingError("INVALID_REQUEST - Property phoneNumber can't be empty");
    }

    const phoneResult = phoneLib(phoneNumber);
    if (!phoneResult.isValid) {
      throw new UserFacingError('Invalid phone number.');
    }

    const findAccount = await QueriesService.findAccountByPhoneNumberOrToken(phoneNumber);
    if (findAccount) {
      throw new UserFacingError('Account already exist.');
    }

    await QueriesService.createUserAccount(fullName, phoneNumber, phoneResult.countryCode);

    return { fullName, phoneNumber, indicative: phoneResult.countryCode };
  }

  async deleteUserAccount(phoneNumber: string) {
    const findAccount = await QueriesService.findAccountByPhoneNumberOrToken(phoneNumber);
    if (!findAccount) {
      throw new NotFoundError(`Account doesn't exist`);
    }

    return await QueriesService.deleteUserAccount(phoneNumber);
  }

  async getAccountName(identifier: string): Promise<AccountNameReturn> {
    const account = await QueriesService.findAccountByPhoneNumberOrToken(identifier);
    if (!account) {
      throw new NotFoundError("Account doesn't exist");
    }

    return account;
  }

  async startTransaction(type: TransactionType, callbackUrl: string, body: TransactionsBody): Promise<TransactionsRes> {
    const phoneNumber = body.creditParty[0].value;
    if (this.findTransactionByStatus('pending', phoneNumber)) {
      throw new UserFacingError('There is a pending transaction for this customer');
    }
    const transactionId = uuidv4();

    switch (type) {
      case 'merchantpay':
        const findMerchant = this.findMerchantByCode(body.merchantCode);

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
            identifierType: body.identifierType
          });
        } else {
          throw new NotFoundError("Don't exist a merchant available with this code");
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
          identifierType: body.identifierType
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
      //TODO Colocar aqui o Nome do customer?
      await axios.put(transaction.callbackUrl, {
        amount: transaction.amount,
        type: transaction.type,
        system: transaction.system,
        phoneNumber: transaction.phoneNumber,
        identifierType: transaction.identifierType
      });
    } catch (error) {
      throw new UserFacingError(error as string);
    }
    return transaction;
  }

  private findTransactionByStatus(status: TransactionStatus, phoneNumber: string) {
    return this.transactions.find((transaction) => transaction.status === status && transaction.phoneNumber === phoneNumber);
  }

  private findTransactionByStatusIndex(status: TransactionStatus, phoneNumber: string) {
    return this.transactions.findIndex((transaction) => transaction.status === status && transaction.phoneNumber === phoneNumber);
  }
  private findMerchantByCode(code: string) {
    return this.merchants.find((elem: Merchant) => elem.code == code && elem.available);
  }
}
const mmoService = new MmoService();
export { mmoService };
