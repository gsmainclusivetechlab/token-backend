import axios, { AxiosError } from 'axios';
import { Request } from 'express';
import { catchError } from '../utils/catch-error';
import { headersValidation } from '../utils/request-validation';
import { MessageService } from './message.service';

class USSDGatewayService {
  async processSend(request: Request) {
    try {
      headersValidation(request);
      const otp = request.headers['sessionid'] as string;
      const { body } = request;

      MessageService.deleteSMSMessage(parseInt(otp));

      const response = await axios.post(process.env.USSD_GATEWAY_API_URL + '/send', body, { headers: { sessionId: otp } });

      return response.data;
    } catch (err: any | AxiosError) {
      catchError(err);
    }
  }
}

const ussdGatewayService = new USSDGatewayService();
export { ussdGatewayService as USSDGatewayService };
