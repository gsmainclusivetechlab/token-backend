import axios, { AxiosError } from 'axios';
import { UserFacingError } from '../classes/errors';
import {
  findKeyByValueSMSOperations,
  SMSOperations,
} from '../enum/sms-operations.enum';
import { LogLevels, logService } from './log.service';
import { OperationsService } from './operations.service';

class SMSService {
  async processSMSMessage(body: any) {
    var smsSplitted: string[] = body.text.split(' ');

    if (smsSplitted.length === 0) {
      throw new UserFacingError('MISSING_OPERATION');
    }

    let tokenApiResponse = null;

    try {
      switch (smsSplitted[0]) {
        case SMSOperations.GetToken:
          //TODO Call MMO API
          tokenApiResponse = await axios.get(
            process.env.TOKEN_API_URL + '/tokens/' + body.phoneNumber
          );

          if (tokenApiResponse.data && tokenApiResponse.data.token) {
            const message = 'Your token is ' + tokenApiResponse.data.token;
            await axios.post(process.env.SMS_GATEWAY_API_URL + '/receive', {
              message: message,
            });
          }

          return 'Thanks for using Engine API';
        case SMSOperations.DeleteToken:
          //TODO Call MMO API
          tokenApiResponse = await axios.get(
            process.env.TOKEN_API_URL + '/tokens/invalidate/' + body.phoneNumber
          );

          if (tokenApiResponse.data && tokenApiResponse.data) {
            const message = 'Your token was deleted';
            await axios.post(process.env.SMS_GATEWAY_API_URL + '/receive', {
              message: message,
            });
          }

          return 'Thanks for using Engine API';
        case SMSOperations.CashIn:
          tokenApiResponse = await axios.get(
            process.env.TOKEN_API_URL + '/tokens/' + body.phoneNumber
          );
          const cashInAccountInfo = await OperationsService.getAccountInfo(
            smsSplitted[1],
            undefined,
            body.phoneNumber
          );
          await axios.post(`${process.env.PROXY_API_URL}/operations/register`, {
            token: tokenApiResponse.data.token,
            type: 'cash-in',
            ...cashInAccountInfo
          });
          return 'Thanks for using Engine API';
        case SMSOperations.CashOut:
          tokenApiResponse = await axios.get(
            process.env.TOKEN_API_URL + '/tokens/' + body.phoneNumber
          );
          const cashOutAccountInfo = await OperationsService.getAccountInfo(
            smsSplitted[1],
            undefined,
            body.phoneNumber
          );
          await axios.post(`${process.env.PROXY_API_URL}/operations/register`, {
            token: tokenApiResponse.data.token,
            type: 'cash-out',
            ...cashOutAccountInfo
          });
          return 'Thanks for using Engine API';
        default:
          throw new UserFacingError('INVALID OPERATION');
      }
    } catch (err: any | AxiosError) {
      if (axios.isAxiosError(err) && err.response) {
        logService.log(LogLevels.ERROR, err.response?.data?.error);
        throw new UserFacingError(
          'OPERATION_ERROR - ' + err.response?.data?.error
        );
      } else {
        logService.log(LogLevels.ERROR, err.message);
        throw new UserFacingError('OPERATION_ERROR - ' + err.message);
      }
    }
  }
}

const smsService = new SMSService();
export { smsService as SMSService };
