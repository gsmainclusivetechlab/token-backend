import axios, { AxiosError } from 'axios';
import { NotFoundError, UserFacingError } from '../classes/errors';
import SafeAwait from '../lib/safe-await';
import { LogLevels, logService } from './log.service';

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
      if (axios.isAxiosError(err) && err.response) {
        logService.log(LogLevels.ERROR, err.response?.data?.error);
        throw new UserFacingError(err.response?.data?.error);
      } else {
        logService.log(LogLevels.ERROR, err.message);
        throw new UserFacingError(err.message);
      }
    }
  }

  async deleteAccount(phoneNumber: string) {
    try {
      return await axios.delete(`${process.env.MMO_API_URL}/accounts/${phoneNumber}`);
    } catch (err: any | AxiosError) {
      if (axios.isAxiosError(err) && err.response) {
        logService.log(LogLevels.ERROR, err.response?.data?.error);
        if (err.response.status === 404) {
          throw new NotFoundError(err.response?.data?.error);
        } else {
          throw new UserFacingError(err.response?.data?.error);
        }
      } else {
        logService.log(LogLevels.ERROR, err.message);
        throw new UserFacingError(err.message);
      }
    }
  }

  async getAccountInfo(identifier: string) {
    const [getAccountNameError, getAccountNameData] = await SafeAwait(
      axios.get(`${process.env.MMO_API_URL}/accounts/${identifier}/accountname`)
    );
    if (getAccountNameError) {
      if (axios.isAxiosError(getAccountNameError) && getAccountNameError.response) {
        logService.log(LogLevels.ERROR, getAccountNameError.response.data?.error);
        if (getAccountNameError.response?.status === 404) {
          throw new NotFoundError('OPERATION_ERROR - ' + getAccountNameError.response?.data?.error);
        } else {
          throw new UserFacingError('OPERATION_ERROR - ' + getAccountNameError.response?.data?.error);
        }
      } else {
        logService.log(LogLevels.ERROR, getAccountNameError.message);
        throw new UserFacingError('OPERATION_ERROR - ' + getAccountNameError.message);
      }
    }
    return { ...getAccountNameData.data };
  }
}

const accountsService = new AccountsService();
export { accountsService as AccountsService };
