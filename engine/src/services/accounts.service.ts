import axios, { AxiosError } from 'axios';
import { NotFoundError, UserFacingError } from '../classes/errors';
import SafeAwait from '../lib/safe-await';
import { LogLevels, logService } from './log.service';

class AccountsService {
  async createAccount(fullName: string, phoneNumber: string) {
    try {
      await axios.post(`${process.env.MMO_API_URL}/accounts/`, {
        fullName,
        phoneNumber,
      });

      await axios.get(`${process.env.TOKEN_API_URL}/tokens/renew/${phoneNumber}`);

      return { fullName, phoneNumber };
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

  //TODO Quando souber se é ON DELETE SET NULL OR CASCADE
  async deleteAccount(phoneNumber: string) {
    return;
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
