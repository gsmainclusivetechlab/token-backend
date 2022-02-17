import axios, { AxiosError } from 'axios';
import { Request } from 'express';
import { UserFacingError } from '../classes/errors';
import { catchError } from '../utils/catch-error';
import { headersValidation } from '../utils/request-validation';
import { UssdMenu } from './ussd.service';

class SendService {
  async processSend(request: Request) {
    const { body, headers } = request;

    const args = {
      phoneNumber: body.phoneNumber, //the end user's phone Number
      sessionId: body.sessionId,
      serviceCode: body.serviceCode, //the USSD code registered with your serviceCode
      //Operator: req.body.networkCode || req.body.Operator, //the end user's network Operator
      text: body.text,
      system: body.system,
      otp: '',
    };

    switch (args.serviceCode) {
      case '*165#': {
        headersValidation(headers);
        args.otp = request.headers['sessionid'] as string;

        await this.verifyIfExistPendingTransation(args.phoneNumber, args.otp, args.serviceCode);

        return UssdMenu.run(args);
      }
      case '*#0#': {
        return 'ACK';
      }
      case '*165#*6*1234': {
        try {
          headersValidation(headers);

          var object = {
            phoneNumber: body.phoneNumber,
            text: args.serviceCode.replace('*165#*', ''),
            system: body.system,
          };

          const sessionId = headers['sessionid'] as string;

          await this.verifyIfExistPendingTransation(args.phoneNumber, sessionId, args.serviceCode);

          var response = await axios.post(process.env.ENGINE_API_URL + '/hooks/ussd-gateway', object, { headers: { sessionId } });
          return response.data;
        } catch (err: any | AxiosError) {
          catchError(err);
        }
      }
      default: {
        headersValidation(headers);
        const sessionId = headers['sessionid'] as string;
        await this.verifyIfExistPendingTransation(args.phoneNumber, sessionId, args.serviceCode);
        throw new UserFacingError('Invalid short code');
      }
    }
  }

  private async verifyIfExistPendingTransation(phoneNumber: string, sessionId: string, serviceCode: string) {
    const getTransactionResponse = await axios.get(`${process.env.ENGINE_API_URL}/transactions/${phoneNumber}/pending`, {
      headers: { sessionId },
    });
    const pendingTransaction = getTransactionResponse.data.transaction;

    if (pendingTransaction) {
      if (serviceCode !== '*165#*6*1234' || (serviceCode === '*165#*6*1234' && pendingTransaction.createdUsing === 'SMS')) {
        await axios.delete(`${process.env.ENGINE_API_URL}/transactions/${phoneNumber}/pending`, {
          headers: { sessionId },
        });
      }
    }
  }
}

const sendService = new SendService();
export { sendService as SendService };
