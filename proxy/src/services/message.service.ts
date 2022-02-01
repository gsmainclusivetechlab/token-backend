import { AxiosError } from 'axios';
import { Request } from 'express';
import { UserFacingError } from '../classes/errors';
import { catchError } from '../utils/catch-error';
import { headersValidation } from '../utils/request-validation';

class MessageService {
  sms_message: { otp: number; message: string }[] = [];

  async processGetSMSMessage(request: Request) {
    try {
      const { headers } = request;
      headersValidation(headers);
      const otp = parseInt(request.headers['sessionid'] as string);

      return { message: this.findSMSMessageByOTP(otp) };
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
