import axios, { AxiosError } from 'axios';
import { Request } from 'express';
import { catchError } from '../utils/catch-error';
import { MessageService } from './message.service';

class SMSGatewayService {
  async processSend(request: Request) {
    try {
      const { body } = request;

      MessageService.setSMSMessage('');

      const response = await axios.post(process.env.SMS_GATEWAY_API_URL + '/send', body);

      return response.data;
    } catch (err: any | AxiosError) {
      catchError(err);
    }
  }

  async processReceive(request: Request) {
    try {
      const { body } = request;
      MessageService.setSMSMessage(body.message);
      return { message: 'Message received successfully' };
    } catch (err: any | AxiosError) {
      catchError(err);
    }
  }
}

const smsGatewayService = new SMSGatewayService();
export { smsGatewayService as SMSGatewayService };
