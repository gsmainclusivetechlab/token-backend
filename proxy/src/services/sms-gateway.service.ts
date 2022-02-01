import axios, { AxiosError } from 'axios';
import { Request } from 'express';
import { UserFacingError } from '../classes/errors';
import { catchError } from '../utils/catch-error';
import { headersValidation } from '../utils/request-validation';
import { MessageService } from './message.service';

class SMSGatewayService {
  async processSend(request: Request) {
    try {
      headersValidation(request);
      const otp = request.headers['sessionid'] as string;
      const { body } = request;

      MessageService.deleteSMSMessage(parseInt(otp));

      const response = await axios.post(process.env.SMS_GATEWAY_API_URL + '/send', body, { headers: { sessionId: otp } });

      return response.data;
    } catch (err: any | AxiosError) {
      catchError(err);
    }
  }

  async processReceive(request: Request) {
    try {
      const { body } = request;
      MessageService.setSMSMessage(body.otp, body.message);
      return { message: 'Message sent.' };
    } catch (err: any | AxiosError) {
      catchError(err);
    }
  }
}

const smsGatewayService = new SMSGatewayService();
export { smsGatewayService as SMSGatewayService };
