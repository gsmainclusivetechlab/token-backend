import axios, { AxiosError } from 'axios';
import { Request } from 'express';
import { UserFacingError } from '../classes/errors';
import { catchError } from '../utils/catch-error';
import { headersValidation } from '../utils/request-validation';
import { SMSService } from './sms.service';

class AccountsService {
  async createAccount(nickName: string, phoneNumber: string) {
    try {
      if (!nickName) {
        throw new UserFacingError('INVALID_REQUEST - Missing property nickName');
      }

      if (nickName.trim() === '') {
        throw new UserFacingError("INVALID_REQUEST - Property nickName can't be empty");
      }

      if (!phoneNumber) {
        throw new UserFacingError('INVALID_REQUEST - Missing property phoneNumber');
      }

      if (phoneNumber.trim() === '') {
        throw new UserFacingError("INVALID_REQUEST - Property phoneNumber can't be empty");
      }

      const createAccountResponse = await axios.post(`${process.env.MMO_API_URL}/accounts/`, {
        nickName,
        phoneNumber,
      });

      await axios.get(`${process.env.TOKEN_API_URL}/tokens/renew/${phoneNumber}`);

      const message = `Welcome ${createAccountResponse.data.nickName}, your OTP is ${createAccountResponse.data.otp}`;
      SMSService.sendCustomerNotification(phoneNumber, message, 'live', createAccountResponse.data.otp);

      return { nickName, phoneNumber, otp: createAccountResponse.data.otp };
    } catch (err: any | AxiosError) {
      catchError(err);
    }
  }

  async deleteAccount(request: Request) {
    try {
      const { headers } = request;
      headersValidation(headers);
      const otp = request.headers['sessionid'] as string;

      const response = await axios.delete(`${process.env.MMO_API_URL}/accounts`, { headers: { sessionId: otp } });
      return { ...response.data };
    } catch (err: any | AxiosError) {
      catchError(err);
    }
  }

  async getAccountInfo(identifier: string) {
    try {
      const response = await axios.get(`${process.env.MMO_API_URL}/accounts/${identifier}/accountname`);
      return { ...response.data };
    } catch (err: any | AxiosError) {
      catchError(err);
    }
  }

  async getMerchant(request: Request) {
    try {
      const { headers, params } = request;
      headersValidation(headers);
      const { code } = params;
      const response = await axios.get(`${process.env.MMO_API_URL}/accounts/${code}/merchant`);
      return { ...response.data };
    } catch (err: any | AxiosError) {
      catchError(err);
    }
  }

  async createMockAccount() {
    try {
      const response = await axios.post(`${process.env.MMO_API_URL}/accounts/createMockAccount`);

      await axios.get(`${process.env.TOKEN_API_URL}/tokens/renew/${response.data.phoneNumber}`);

      return { ...response.data };
    } catch (err: any | AxiosError) {
      catchError(err);
    }
  }

  async verifyOTP(request: Request) {
    try {
      const { otp } = request.params;

      const response = await axios.get(`${process.env.MMO_API_URL}/accounts/${otp}/valid`);
      return { ...response.data };
    } catch (err: any | AxiosError) {
      catchError(err);
    }
  }
}

const accountsService = new AccountsService();
export { accountsService as AccountsService };
