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

      await axios.post(`${process.env.ENGINE_API_URL}/accounts/`, {
        nickName,
        phoneNumber,
      });

      return { nickName, phoneNumber };
    } catch (err: any | AxiosError) {
      catchError(err);
    }
  }

  async deleteAccount(phoneNumber: string) {
    try {
      if (!phoneNumber) {
        throw new UserFacingError('INVALID_REQUEST - Missing property phoneNumber');
      }

      if (phoneNumber.trim() === '') {
        throw new UserFacingError("INVALID_REQUEST - Property phoneNumber can't be empty");
      }

      const response = await axios.delete(`${process.env.ENGINE_API_URL}/accounts/${phoneNumber}`);
      return { ...response.data };
    } catch (err: any | AxiosError) {
      catchError(err);
    }
  }
}

const accountsService = new AccountsService();
export { accountsService as AccountsService };
