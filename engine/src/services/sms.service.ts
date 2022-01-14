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
    try {
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
        this.sendCustomerNotification(phoneNumber, message, system);
        throw new UserFacingError('Missing operation');
      }

      let tokenApiResponse = null;

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
            this.sendCustomerNotification(phoneNumber, message, system);
            throw new UserFacingError('Missing amount');
          }

          tokenApiResponse = await axios.get(`${process.env.TOKEN_API_URL}/tokens/${phoneNumber}`);

          const operationCashInObj: Operation = {
            type: 'cash-in',
            amount: smsSplitted[1],
            system,
            identifier: tokenApiResponse.data.token,
            identifierType: 'token',
            customerInfo: getAccountNameData
          };

          axios.post(`${process.env.PROXY_API_URL}/operations/register`, {
            ...operationCashInObj,
          });
          break;
        case SMSOperations.CashOut:
          if (!smsSplitted[1]) {
            //TODO Colocar messagem
            const message = 'TODO';
            this.sendCustomerNotification(phoneNumber, message, system);
            throw new UserFacingError('Missing amount');
          }

          tokenApiResponse = await axios.get(`${process.env.TOKEN_API_URL}/tokens/${phoneNumber}`);

          const operationCashOutObj: Operation = {
            type: 'cash-out',
            amount: smsSplitted[1],
            system,
            identifier: tokenApiResponse.data.token,
            identifierType: 'token',
            customerInfo: getAccountNameData
          };

          axios.post(`${process.env.PROXY_API_URL}/operations/register`, {
            ...operationCashOutObj
          });
          break;
        case SMSOperations.Pin:
          if (!smsSplitted[1]) {
            //TODO Colocar messagem
            const message = 'TODO';
            this.sendCustomerNotification(phoneNumber, message, system);
            throw new UserFacingError('Missing pin');
          }

          try {
            await axios.post(`${process.env.MMO_API_URL}/accounts/authorize`, {
              pin: smsSplitted[1],
              phoneNumber,
            });
          } catch (error: any | AxiosError) {
            if (axios.isAxiosError(error)) {
              if (error.response?.status === 401) {
                const notification = `Operation Rejected - Wrong PIN`;
                //Agent Notification
                axios.post(`${process.env.PROXY_API_URL}/operations/notify`, {
                  notification,
                });
                this.sendCustomerNotification(phoneNumber, notification, system);
              }
            }
          }
          break;
        // case SMSOperations.Payment:
        //   if (!smsSplitted[1]) {
        //     throw new UserFacingError('Missing merchant code');
        //   }

        //   if (!smsSplitted[2]) {
        //     throw new UserFacingError('Missing amount');
        //   }

        //   tokenApiResponse = await axios.get(`${process.env.TOKEN_API_URL + '/tokens/' + body.phoneNumber);
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
          //TODO Colocar messagem
          const message = 'TODO';
          this.sendCustomerNotification(phoneNumber, message, system);
          throw new UserFacingError('INVALID OPERATION');
      }
      return { message: 'Thanks for using Engine API' };
    } catch (err: any | AxiosError) {
      if (axios.isAxiosError(err) && err.response) {
        logService.log(LogLevels.ERROR, err.response?.data?.error);
        const error_message = 'OPERATION_ERROR - ' + err.response?.data?.error;
        if (err.response.status === 404) {
          throw new NotFoundError(error_message);
        } else {
          throw new UserFacingError(error_message);
        }
      } else {
        logService.log(LogLevels.ERROR, err.message);
        if (err.name === 'NotFoundError') {
          throw new NotFoundError(err.message);
        } else {
          throw new UserFacingError('OPERATION_ERROR - ' + err.message);
        }
      }
    }
  }

  sendCustomerNotification(phoneNumber: string, message: string, system: SystemType) {
    axios.post(process.env.SMS_GATEWAY_API_URL + '/receive', {
      phoneNumber,
      message,
      system,
    });
  }
}

const smsService = new SMSService();
export { smsService as SMSService };
