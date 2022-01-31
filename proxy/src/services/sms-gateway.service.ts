import axios, { AxiosError } from 'axios';
import { Request } from 'express';
import { UserFacingError } from '../classes/errors';
import { catchError } from '../utils/catch-error';
import { MessageService } from './message.service';

class SMSGatewayService {
  async processSend(request: Request) {
    try {
      const { body, headers } = request;

      const sessionId = headers['sessionid'] as string;
      if (!sessionId) {
        throw new UserFacingError('Header sessionId is mandatory!');
      }
      const parsedSessionId = parseInt(sessionId);

      if (isNaN(parsedSessionId) || parsedSessionId % 1 != 0) {
        throw new UserFacingError('Header sessionId needs to be a number without decimals!');
      }

      MessageService.deleteSMSMessage(parsedSessionId);

      const response = await axios.post(process.env.SMS_GATEWAY_API_URL + '/send', body, { headers: { sessionId } });

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
