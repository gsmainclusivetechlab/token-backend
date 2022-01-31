import axios, { AxiosError } from 'axios';
import { Request } from 'express';
import { UserFacingError } from '../classes/errors';
import { catchError } from '../utils/catch-error';
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

      const message = ``;
      //SMSService.sendCustomerNotification(phoneNumber, message, 'live');

      return { nickName, phoneNumber, otp: createAccountResponse.data.otp };
    } catch (err: any | AxiosError) {
      catchError(err);
    }
  }

  async deleteAccount(request: Request) {
    try {
      const { headers } = request;

      const sessionId = headers['sessionid'] as string;
      if (!sessionId) {
        throw new UserFacingError('Header sessionId is mandatory!');
      }
      const parsedSessionId = parseInt(sessionId);

      if (isNaN(parsedSessionId) || parsedSessionId % 1 != 0) {
        throw new UserFacingError('Header sessionId needs to be a number without decimals!');
      }

      const response = await axios.delete(`${process.env.MMO_API_URL}/accounts`, { headers: { sessionId } });
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

  async getMerchant(code: string) {
    try {
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
}

const accountsService = new AccountsService();
export { accountsService as AccountsService };
