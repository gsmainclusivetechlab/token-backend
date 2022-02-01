import { AxiosError } from 'axios';
import { Request } from 'express';
import { UserFacingError } from '../classes/errors';
import { catchError } from '../utils/catch-error';

class MessageService {
  sms_message: { otp: number; message: string }[] = [];

  async processGetSMSMessage(request: Request) {
    try {
      const sessionId = request.headers['sessionid'] as string;
      if (!sessionId) {
        throw new UserFacingError('Header sessionId is mandatory!');
      }
      const parsedSessionId = parseInt(sessionId);

      if (isNaN(parsedSessionId) || parsedSessionId % 1 != 0) {
        throw new UserFacingError('Header sessionId needs to be a number without decimals!');
      }

      return { message: this.findSMSMessageByOTP(parsedSessionId) };
    } catch (err: any | AxiosError) {
      catchError(err);
    }
  }

  setSMSMessage(otp: number, message: string) {
    let obj = this.sms_message.find((el) => el.otp === otp);
    if (obj) {
      obj.message = message;
    } else {
      this.sms_message.push({ otp, message });
    }
  }

  deleteSMSMessage(otp: number) {
    const index = this.sms_message.findIndex((el) => el.otp === otp);
    if (index != -1) {
      this.sms_message.splice(index, 1);
    }
  }

  private findSMSMessageByOTP(otp: number): string {
    const obj = this.sms_message.find((el) => el.otp === otp);
    return obj ? obj.message : '';
  }
}

const messageService = new MessageService();
export { messageService as MessageService };
