import axios, { AxiosError } from 'axios';
import { UserFacingError } from '../classes/errors';
import { catchError } from '../utils/catch-error';

class AccountsService {
  map = new Map<number, number>();
  pollInterval: any;

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

      const response = await axios.post(`${process.env.ENGINE_API_URL}/accounts/`, {
        nickName,
        phoneNumber,
      });

      return { ...response.data };
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

  async createMockAccount() {
    try {
      const response = await axios.post(`${process.env.ENGINE_API_URL}/accounts/createMockAccount`);
      return { ...response.data };
    } catch (err: any | AxiosError) {
      catchError(err);
    }
  }

  updateSessionLastCall(otp: number) {
    this.map.set(otp, new Date().getTime());
    if (!this.pollInterval) this.triggerSetInterval();
  }

  triggerSetInterval() {
    this.pollInterval = setInterval(() => {
      this.manageSessions();
    }, 1000); //save reference to the interval
  }

  manageSessions() {
    this.map.forEach((value: number, key: number) => {
      const now = new Date().getTime();
      const dif = value - now;
      const secondsFromT1toT2 = dif / 1000;
      const secondsBetweenDates = Math.abs(secondsFromT1toT2);
      if (secondsBetweenDates >= 5) {
        //Delete Session
        this.map.delete(key);

        try {
          axios.delete(`${process.env.ENGINE_API_URL}/accounts`, { headers: { sessionId: String(key) } });
        } catch (err: any | AxiosError) {
          catchError(err);
        }
      }
    });
  }
}

const accountsService = new AccountsService();
export { accountsService as AccountsService };
