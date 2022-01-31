import { ConflictError, NotFoundError, UserFacingError } from '../classes/errors';
import { AccountNameReturn, CreateAccountReturn } from '../interfaces/account-name';
import { Merchant } from '../interfaces/transaction';
import { phone as phoneLib } from 'phone';
import { QueriesService } from './queries.service';
import { getRandom } from '../utils/random';
import { MmoService } from './mmo.service';
import { Request } from 'express';

class AccountsService {
  merchants: Merchant[] = [{ code: '4321', name: 'XPTO Lda', available: true }];

  async createUserAccount(nickName: string, phoneNumber: string): Promise<CreateAccountReturn> {
    if (!nickName) {
      throw new UserFacingError('INVALID_REQUEST - Missing property nickName');
    }

    if (nickName.trim() === '') {
      throw new UserFacingError("INVALID_REQUEST - Property nickName can't be empty");
    }

    if (nickName.length > 50) {
      throw new UserFacingError('INVALID_REQUEST - Property nickName exceeded max length');
    }

    if (!phoneNumber) {
      throw new UserFacingError('INVALID_REQUEST - Missing property phoneNumber');
    }

    if (phoneNumber.trim() === '') {
      throw new UserFacingError("INVALID_REQUEST - Property phoneNumber can't be empty");
    }

    if (phoneNumber.length > 50) {
      throw new UserFacingError('INVALID_REQUEST - Property phoneNumber exceeded max length');
    }

    const phoneResult = phoneLib(phoneNumber);
    if (!phoneResult.isValid) {
      throw new UserFacingError('Invalid phone number.');
    }

    const findAccount = await QueriesService.findAccountByPhoneNumberOrToken(phoneNumber);
    if (findAccount) {
      throw new ConflictError('This mobile phone is already registered to another user.');
    }

    const newOTP = await this.generateNewOtp();

    await QueriesService.createUserAccount(nickName, phoneNumber, phoneResult.countryCode, newOTP);

    return { nickName, phoneNumber, indicative: phoneResult.countryCode, otp: newOTP };
  }

  async deleteUserAccount(request: Request) {
    const sessionId = request.headers['sessionid'] as string;
    if (!sessionId) {
      throw new UserFacingError('Header sessionId is mandatory!');
    }
    const parsedSessionId = parseInt(sessionId);

    if (isNaN(parsedSessionId) || parsedSessionId % 1 != 0) {
      throw new UserFacingError('Header sessionId needs to be a number without decimals!');
    }

    const findAccount = await QueriesService.findAccountByOTP(parsedSessionId);
    if (!findAccount) {
      throw new NotFoundError(`Doesn't exist any user with this phone number.`);
    }

    await QueriesService.deleteUserAccountByOTP(parsedSessionId);

    MmoService.deleteTransactionsByOTP(parsedSessionId);

    return { message: 'User deleted' };
  }

  async getAccountName(identifier: string): Promise<AccountNameReturn> {
    if (!identifier) {
      throw new UserFacingError(`INVALID_REQUEST - Property identifier can't be null`);
    }

    if (identifier.length > 50) {
      throw new UserFacingError('INVALID_REQUEST - Property identifier exceeded max length');
    }

    const account = await QueriesService.findAccountByPhoneNumberOrToken(identifier);
    if (!account) {
      throw new NotFoundError("Doesn't exist any user with this phone number or token.");
    }

    return account;
  }

  async getMerchant(code: string): Promise<any> {
    const merchant = this.findMerchantByCode(code);
    if (!merchant) {
      throw new NotFoundError("Doesn't exist a merchant available with this code");
    }

    return merchant;
  }

  async createMockAccount(): Promise<CreateAccountReturn> {
    const mockName = 'MockUser';
    const seven_digits = getRandom(7);
    const mockPhoneNumber = '+35192' + seven_digits;

    const findAccount = await QueriesService.findAccountByPhoneNumberOrToken(mockPhoneNumber);
    if (findAccount) {
      await this.createMockAccount();
    }

    const newOTP = await this.generateNewOtp();

    await QueriesService.createUserAccount(mockName, mockPhoneNumber, '+351', newOTP);

    return { nickName: mockName, phoneNumber: mockPhoneNumber, indicative: '+351', otp: newOTP };
  }

  findMerchantByCode(code: string) {
    return this.merchants.find((elem: Merchant) => elem.code == code && elem.available);
  }

  private async generateNewOtp(): Promise<number> {
    const newOTP = getRandom(4);

    const account = await QueriesService.findAccountByOTP(newOTP);
    if (account) {
      await this.generateNewOtp();
    }

    return newOTP;
  }
}

const accountsService = new AccountsService();
export { accountsService as AccountsService };