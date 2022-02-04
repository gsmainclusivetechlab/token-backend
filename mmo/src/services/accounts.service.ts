import { ConflictError, NotFoundError, UserFacingError } from '../classes/errors';
import { AccountNameReturn, CreateAccountReturn } from '../interfaces/account-name';
import { Merchant } from '../interfaces/transaction';
import { phone as phoneLib } from 'phone';
import { QueriesService } from './queries.service';
import { getRandom } from '../utils/random';
import { MmoService } from './mmo.service';
import { Request } from 'express';
import { headersValidation } from '../utils/request-validation';

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
    const { headers } = request;
    headersValidation(headers);

    const otp = parseInt(request.headers['sessionid'] as string);

    const findAccount = await QueriesService.findAccountByOTP(otp);
    if (!findAccount) {
      throw new NotFoundError(`Doesn't exist any user with this phone number.`);
    }

    await QueriesService.deleteUserAccountByOTP(otp);

    MmoService.deleteTransactionsByOTP(otp);

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

  async verifyOTP(request: Request): Promise<AccountNameReturn> {
    const { otp } = request.params;

    if (!otp) {
      throw new UserFacingError(`INVALID_REQUEST - Property otp can't be null`);
    }

    const parsedOtp = parseInt(otp);

    if (isNaN(parsedOtp) || parsedOtp % 1 != 0) {
      throw new UserFacingError('INVALID_REQUEST - Property otp needs to be a number without decimals!');
    }

    const account = await QueriesService.findAccountByOTP(parsedOtp);
    if (!account) {
      throw new NotFoundError("Doesn't exist any user with this otp.");
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
    const four_digits = getRandom(4);
    const contryCode = '+44';
    const mockPhoneNumber = contryCode + '123456' + four_digits;

    const findAccount = await QueriesService.findAccountByPhoneNumberOrToken(mockPhoneNumber);
    if (findAccount) {
      await this.createMockAccount();
    }

    const newOTP = await this.generateNewOtp();

    await QueriesService.createUserAccount(mockName, mockPhoneNumber, contryCode, newOTP);

    return { nickName: mockName, phoneNumber: mockPhoneNumber, indicative: contryCode, otp: newOTP };
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
