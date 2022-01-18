import axios, { AxiosError } from 'axios';
import { UserFacingError } from '../classes/errors';
import { USSDOperations } from '../enum/ussd-operations.enum';
import { USSDWebhookBody } from '../interfaces/hook';
import { LogLevels, logService } from './log.service';
import { OperationsService } from './operations.service';
import { phone as phoneLib } from 'phone';
import { AccountsService } from './accounts.service';
import { SMSService } from './sms.service';
import { catchError } from '../utils/catch-error';
import { Operation } from '../interfaces/operation';

class USSDService {
  async processUSSDMessage(obj: USSDWebhookBody) {
    try {
      const { phoneNumber, text, system } = obj;

      //Check if phone number is valid
      const phoneResult = phoneLib(phoneNumber);
      if (!phoneResult.isValid) {
        throw new UserFacingError('OPERATION_ERROR - Invalid phone number.');
      }

      //Check if phone number is registry
      const getAccountNameData = await AccountsService.getAccountInfo(phoneNumber);

      var ussdSplitted: string[] = text.split('*');
      if (ussdSplitted.length === 0) {
        const message = `Please send a valid operation`;
        SMSService.sendCustomerNotification(phoneNumber, message, system);
        throw new UserFacingError('OPERATION_ERROR - Missing operation');
      }

      let tokenApiResponse = null;

      switch (ussdSplitted[0]) {
        case USSDOperations.GetToken:
          tokenApiResponse = await axios.get(`${process.env.TOKEN_API_URL}/tokens/renew/${phoneNumber}`);

          if (tokenApiResponse.data && tokenApiResponse.data.token) {
            const message = 'Your token is ' + tokenApiResponse.data.token;
            SMSService.sendCustomerNotification(phoneNumber, message, system);
          }
          break;
        case USSDOperations.DeleteToken:
          try {
            tokenApiResponse = await axios.get(`${process.env.TOKEN_API_URL}/tokens/invalidate/${phoneNumber}`);

            if (tokenApiResponse.data && tokenApiResponse.data) {
              const message = 'Your token was deleted';
              SMSService.sendCustomerNotification(phoneNumber, message, system);
            }
          } catch (err: any | AxiosError) {
            if (axios.isAxiosError(err)) {
              if (err.response?.status === 404) {
                const message = `You need to have an associated token to delete`;
                SMSService.sendCustomerNotification(phoneNumber, message, system);
              }
            }
            catchError(err);
          }

          break;
        case USSDOperations.CashIn:
          if (!ussdSplitted[1]) {
            const message = `To make a CASH-IN, send the follow message 'CASH_IN <space> {AMOUNT}'`;
            SMSService.sendCustomerNotification(phoneNumber, message, system);
            throw new UserFacingError('OPERATION_ERROR - Missing amount value');
          }

          SMSService.validateAmount(ussdSplitted[1], phoneNumber, system);

          tokenApiResponse = await axios.get(`${process.env.TOKEN_API_URL}/tokens/${phoneNumber}`);

          const operationCashInObj: Operation = {
            type: 'cash-in',
            amount: Number(ussdSplitted[1]),
            system,
            identifier: tokenApiResponse.data.token,
            identifierType: 'token',
            customerInfo: getAccountNameData,
          };

          axios.post(`${process.env.PROXY_API_URL}/operations/register`, {
            ...operationCashInObj,
          });
          break;
        case USSDOperations.CashOut:
          if (!ussdSplitted[1]) {
            const message = `To make a CASH-OUT, send the follow message 'CASH_OUT <space> {AMOUNT}'`;
            SMSService.sendCustomerNotification(phoneNumber, message, system);
            throw new UserFacingError('OPERATION_ERROR - Missing amount value');
          }

          SMSService.validateAmount(ussdSplitted[1], phoneNumber, system);

          tokenApiResponse = await axios.get(`${process.env.TOKEN_API_URL}/tokens/${phoneNumber}`);

          const operationCashOutObj: Operation = {
            type: 'cash-out',
            amount: Number(ussdSplitted[1]),
            system,
            identifier: tokenApiResponse.data.token,
            identifierType: 'token',
            customerInfo: getAccountNameData,
          };

          axios.post(`${process.env.PROXY_API_URL}/operations/register`, {
            ...operationCashOutObj,
          });
          break;
        case USSDOperations.Payment:
          if (!ussdSplitted[1]) {
            const message = `To make a Payment, send the follow message 'PAYMENT <space> {MERCHANT_CODE} <space> {AMOUNT}'`;
            SMSService.sendCustomerNotification(phoneNumber, message, system);
            throw new UserFacingError('OPERATION_ERROR - Missing merchant code');
          }

          if (!ussdSplitted[2]) {
            const message = `To make a Payment, send the follow message 'PAYMENT <space> {MERCHANT_CODE} <space> {AMOUNT}'`;
            SMSService.sendCustomerNotification(phoneNumber, message, system);
            throw new UserFacingError('OPERATION_ERROR - Missing amount value');
          }

          SMSService.validateAmount(ussdSplitted[2], phoneNumber, system);

          tokenApiResponse = await axios.get(`${process.env.TOKEN_API_URL}/tokens/${phoneNumber}`);

          const operationMerchantPaymentObj: Operation = {
            type: 'merchant-payment',
            amount: Number(ussdSplitted[2]),
            identifier: tokenApiResponse.data.token,
            system,
            merchantCode: ussdSplitted[1],
            customerInfo: getAccountNameData,
          };

          try {
            await OperationsService.manageOperation('accept', operationMerchantPaymentObj);
          } catch (err: any | AxiosError) {
            if (err.name === 'NotFoundError') {
              //Perceber se a mensagem é pq o merchant não existe
              const message = `Doesn't exist any merchant available with that code`;
              SMSService.sendCustomerNotification(phoneNumber, message, system);
            }
            catchError(err);
          }

          break;
        default:
          const message = `Please send a valid operation`;
          SMSService.sendCustomerNotification(phoneNumber, message, system);
          throw new UserFacingError('OPERATION_ERROR - Invalid operation');
      }
    } catch (err: any | AxiosError) {
      catchError(err);
    }
  }
}

const ussdService = new USSDService();
export { ussdService as USSDService };
