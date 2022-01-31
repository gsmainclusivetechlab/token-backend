import { AxiosError } from 'axios';
import { Request } from 'express';
import { catchError } from '../utils/catch-error';

class MessageService {
  sms_message: { otp: number; message: string }[] = [];

  async processGetSMSMessage(request: Request) {
    try {
      return { message: this.sms_message };
    } catch (err: any | AxiosError) {
      catchError(err);
    }
  }

  setSMSMessage(otp: number, message: string) {
    this.sms_message.push({ otp, message });
  }

  deleteSMSMessage(otp: number){
    const index = this.sms_message.findIndex(el => el.otp === otp);
    if(index != -1){
      this.sms_message.splice(index,1);
    }
  }
}

const messageService = new MessageService();
export { messageService as MessageService };
