import axios, { AxiosError } from 'axios';
import { UserFacingError } from '../classes/errors';
import { catchError } from '../utils/catch-error';

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

      await axios.post(`${process.env.MMO_API_URL}/accounts/`, {
        nickName,
        phoneNumber,
      });

      await axios.get(`${process.env.TOKEN_API_URL}/tokens/renew/${phoneNumber}`);

      return { nickName, phoneNumber };
    } catch (err: any | AxiosError) {
      catchError(err);
    }
  }

  async deleteAccount(phoneNumber: string) {
    try {
      return await axios.delete(`${process.env.MMO_API_URL}/accounts/${phoneNumber}`);
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
}

const accountsService = new AccountsService();
export { accountsService as AccountsService };
