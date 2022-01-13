import axios, { AxiosError } from 'axios';
import { NotFoundError, UserFacingError } from '../classes/errors';
import { LogLevels, logService } from './log.service';

class AccountsService {
  async deleteAccount(phoneNumber: string) {
    try {
      return await axios.delete(`${process.env.ENGINE_API_URL}/accounts/${phoneNumber}`);
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
}

const accountsService = new AccountsService();
export { accountsService as AccountsService };
