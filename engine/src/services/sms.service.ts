import axios, { AxiosError } from 'axios';
import { UserFacingError } from '../classes/errors';
import { SMSOperations } from '../enum/sms-operations.enum';
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
          tokenApiResponse = await axios.get(
            process.env.TOKEN_API_URL + '/tokens/renew/' + body.phoneNumber
          );

          if (tokenApiResponse.data && tokenApiResponse.data.token) {
            const message = 'Your token is ' + tokenApiResponse.data.token;
            await axios.post(process.env.SMS_GATEWAY_API_URL + '/receive', {
              message: message,
              system: body.system,
              phoneNumber: body.phoneNumber
            });
          }

          return 'Thanks for using Engine API';
        case SMSOperations.DeleteToken:
          tokenApiResponse = await axios.get(
            process.env.TOKEN_API_URL + '/tokens/invalidate/' + body.phoneNumber
          );

          if (tokenApiResponse.data && tokenApiResponse.data) {
            const message = 'Your token was deleted';
            await axios.post(process.env.SMS_GATEWAY_API_URL + '/receive', {
              message: message,
              system: body.system,
              phoneNumber: body.phoneNumber
            });
          }

          return 'Thanks for using Engine API';
        case SMSOperations.CashIn:
          if(!smsSplitted[1]){
            throw new UserFacingError("Missing amount"); 
          }

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
            ...cashInAccountInfo,
            system: body.system
          });
          return 'Thanks for using Engine API';
        case SMSOperations.CashOut:
          if(!smsSplitted[1]){
            throw new UserFacingError("Missing amount"); 
          }

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
            ...cashOutAccountInfo,
            system: body.system,
          });
          return 'Thanks for using Engine API';
        case SMSOperations.Pin:
          try {
            await axios.post(`${process.env.MMO_API_URL}/accounts/authorize`, {
              pin: smsSplitted[1],
              phoneNumber: body.phoneNumber,
            });
          } catch (error: any | AxiosError) {
            if (axios.isAxiosError(error)) {
              if(error.response?.status === 401) {
                const notification = `Operation Rejected - Wrong PIN`;
                //Agent Notification
                axios.post(`${process.env.PROXY_API_URL}/operations/notify`, {
                  notification,
                });
                //Customer Notification
                axios.post(process.env.SMS_GATEWAY_API_URL + '/receive', {
                  message: notification,
                  system: body.system,
                });
              }
            }
          }
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
