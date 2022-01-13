import axios, { AxiosError } from 'axios';
import { NotFoundError, UserFacingError } from '../classes/errors';
import { SMSOperations } from '../enum/sms-operations.enum';
import { Operation, SystemType } from '../interfaces/operation';
import { SMSWebhookBody } from '../interfaces/sms';
import { LogLevels, logService } from './log.service';
import { OperationsService } from './operations.service';
import { phone as phoneLib } from 'phone';
import SafeAwait from '../lib/safe-await';
import { AccountsService } from './accounts.service';

class SMSService {
  async processSMSMessage(obj: SMSWebhookBody) {
    const { phoneNumber, text, system } = obj;

    //Check if phone number is valid
    const phoneResult = phoneLib(phoneNumber);
    if (!phoneResult.isValid) {
      throw new UserFacingError('Invalid phone number.');
    }

    //Check if phone number is registry
    const getAccountNameData = await AccountsService.getAccountInfo(phoneNumber);

    var smsSplitted: string[] = text.split(' ');
    if (smsSplitted.length === 0) {
      //TODO Colocar messagem
      const message = 'TODO';
      await this.sendCustomerNotification(phoneNumber, message, system);

      throw new UserFacingError('Missing operation');
    }

    let tokenApiResponse = null;

    try {
      switch (smsSplitted[0]) {
        case SMSOperations.GetToken:
          tokenApiResponse = await axios.get(`${process.env.TOKEN_API_URL}/tokens/renew/${phoneNumber}`);

          if (tokenApiResponse.data && tokenApiResponse.data.token) {
            const message = 'Your token is ' + tokenApiResponse.data.token;
            this.sendCustomerNotification(phoneNumber, message, system);
          }
          break;
        case SMSOperations.DeleteToken:
          tokenApiResponse = await axios.get(`${process.env.TOKEN_API_URL}/tokens/invalidate/${phoneNumber}`);

          if (tokenApiResponse.data && tokenApiResponse.data) {
            const message = 'Your token was deleted';
            this.sendCustomerNotification(phoneNumber, message, system);
          }

          break;
        case SMSOperations.CashIn:
          if (!smsSplitted[1]) {
            //TODO Colocar messagem
            const message = 'TODO';
            await this.sendCustomerNotification(phoneNumber, message, system);
            throw new UserFacingError('Missing amount');
          }

          tokenApiResponse = await axios.get(`${process.env.TOKEN_API_URL}/tokens/renew/${phoneNumber}`);
          await axios.post(`${process.env.PROXY_API_URL}/operations/register`, {
            token: tokenApiResponse.data.token,
            type: 'cash-in',
            ...getAccountNameData,
            system,
          });
          break;
        case SMSOperations.CashOut:
          if (!smsSplitted[1]) {
            //TODO Colocar messagem
            const message = 'TODO';
            await this.sendCustomerNotification(phoneNumber, message, system);
            throw new UserFacingError('Missing amount');
          }

          tokenApiResponse = await axios.get(`${process.env.TOKEN_API_URL}/tokens/renew/${phoneNumber}`);
          await axios.post(`${process.env.PROXY_API_URL}/operations/register`, {
            token: tokenApiResponse.data.token,
            type: 'cash-out',
            ...getAccountNameData,
            system,
          });
          break;
        // case SMSOperations.Pin:
        //   try {
        //     await axios.post(`${process.env.MMO_API_URL}/accounts/authorize`, {
        //       pin: smsSplitted[1],
        //       phoneNumber,
        //     });
        //   } catch (error: any | AxiosError) {
        //     if (axios.isAxiosError(error)) {
        //       if (error.response?.status === 401) {
        //         const notification = `Operation Rejected - Wrong PIN`;
        //         //Agent Notification
        //         axios.post(`${process.env.PROXY_API_URL}/operations/notify`, {
        //           notification,
        //         });
        //         //Customer Notification
        //         // axios.post(process.env.SMS_GATEWAY_API_URL + '/receive', {
        //         //   message: notification,
        //         //   system: body.system,
        //         // });

        //         await this.sendCustomerNotification(phoneNumber, notification, system);
        //       }
        //     }
        //   }
        //   break;
        // case SMSOperations.Payment:
        //   if (!smsSplitted[1]) {
        //     throw new UserFacingError('Missing merchant code');
        //   }

        //   if (!smsSplitted[2]) {
        //     throw new UserFacingError('Missing amount');
        //   }

        //   tokenApiResponse = await axios.get(process.env.TOKEN_API_URL + '/tokens/' + body.phoneNumber);
        //   //TODO Fazer refactor ao getAccountInfo para nao receber o amount
        //   const responseAccountInfo = await OperationsService.getAccountInfo(smsSplitted[2], undefined, body.phoneNumber);

        //   const operationObj: Operation = {
        //     type: 'merchant-payment',
        //     amount: smsSplitted[2],
        //     phoneNumber: body.phoneNumber,
        //     system: body.system,
        //     merchantCode: smsSplitted[1],
        //   };

        //   //TODO Adicionar operação e fazer refactor para receber o telefone
        //   const responseTransaction = await OperationsService.manageOperation('accept', operationObj);

        //   return 'Thanks for using Engine API';
        default:
          throw new UserFacingError('INVALID OPERATION');
      }
    } catch (err: any | AxiosError) {
      if (axios.isAxiosError(err) && err.response) {
        logService.log(LogLevels.ERROR, err.response?.data?.error);
        throw new UserFacingError('OPERATION_ERROR - ' + err.response?.data?.error);
      } else {
        logService.log(LogLevels.ERROR, err.message);
        throw new UserFacingError('OPERATION_ERROR - ' + err.message);
      }
    }

    return { message: 'Thanks for using Engine API' };
  }

  async sendCustomerNotification(phoneNumber: string, message: string, system: SystemType) {
    await axios.post(process.env.SMS_GATEWAY_API_URL + '/receive', {
      phoneNumber,
      message,
      system,
    });
  }
}

const smsService = new SMSService();
export { smsService as SMSService };
