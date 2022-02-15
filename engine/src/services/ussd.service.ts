import axios, { AxiosError } from 'axios';
import { UserFacingError } from '../classes/errors';
import { USSDOperations } from '../enum/ussd-operations.enum';
import { USSDWebhookBody } from '../interfaces/hook';
import { OperationsService } from './operations.service';
import { AccountsService } from './accounts.service';
import { SMSService } from './sms.service';
import { catchError } from '../utils/catch-error';
import { IdentifierType, Operation } from '../interfaces/operation';

class USSDService {
  async processUSSDMessage(obj: USSDWebhookBody) {
    try {
      const { phoneNumber, text, system } = obj;

      //Check if phone number is registry
      const getAccountNameData = await AccountsService.getAccountInfo(phoneNumber);
      var message: string = '';

      var ussdSplitted: string[] = text.split('*');
      if (ussdSplitted.length === 0) {
        message = `Thank you for using the Tokenisation Solution from Inclusive Tech Lab. Please, send a valid operation code/message.`;
        SMSService.sendCustomerNotification(phoneNumber, message, system, getAccountNameData.otp);
        throw new UserFacingError('OPERATION_ERROR - Missing operation');
      }

      var tokenApiResponse = null;
      var identifier = null;
      var identifierType: IdentifierType | undefined = undefined;

      switch (ussdSplitted[0]) {
        case USSDOperations.GetToken:
          OperationsService.getToken(phoneNumber, system, getAccountNameData);
          break;
        case USSDOperations.DeleteToken:
          OperationsService.deleteToken(phoneNumber, system, getAccountNameData);
          break;
        case USSDOperations.CashIn:
          if (!ussdSplitted[1]) {
            message = `To make a CASH-IN, send the follow message 'CASH IN <space> {AMOUNT}'`;
            SMSService.sendCustomerNotification(phoneNumber, message, system, getAccountNameData.otp);
            throw new UserFacingError('OPERATION_ERROR - Missing amount value');
          }

          SMSService.validateAmount(ussdSplitted[1], phoneNumber, system, getAccountNameData.otp);

          if (getAccountNameData.active) {
            tokenApiResponse = await axios.get(`${process.env.TOKEN_API_URL}/tokens/${phoneNumber}`);
            identifier = tokenApiResponse.data.token;
            identifierType = 'token';
          } else {
            identifier = phoneNumber;
            identifierType = 'phoneNumber';
          }

          const operationCashInObj: Operation = {
            type: 'cash-in',
            amount: Number(ussdSplitted[1]),
            system,
            identifier,
            identifierType,
            customerInfo: getAccountNameData,
          };

          axios.post(
            `${process.env.PROXY_API_URL}/operations/register`,
            {
              ...operationCashInObj,
            },
            { headers: { sessionId: String(getAccountNameData.otp) } }
          );
          break;
        case USSDOperations.CashOut:
          if (!ussdSplitted[1]) {
            message = `To make a CASH-OUT, send the follow message 'CASH OUT <space> {AMOUNT}'`;
            SMSService.sendCustomerNotification(phoneNumber, message, system, getAccountNameData.otp);
            throw new UserFacingError('OPERATION_ERROR - Missing amount value');
          }

          SMSService.validateAmount(ussdSplitted[1], phoneNumber, system, getAccountNameData.otp);

          if (getAccountNameData.active) {
            tokenApiResponse = await axios.get(`${process.env.TOKEN_API_URL}/tokens/${phoneNumber}`);
            identifier = tokenApiResponse.data.token;
            identifierType = 'token';
          } else {
            identifier = phoneNumber;
            identifierType = 'phoneNumber';
          }

          const operationCashOutObj: Operation = {
            type: 'cash-out',
            amount: Number(ussdSplitted[1]),
            system,
            identifier,
            identifierType,
            customerInfo: getAccountNameData,
          };

          axios.post(
            `${process.env.PROXY_API_URL}/operations/register`,
            {
              ...operationCashOutObj,
            },
            { headers: { sessionId: String(getAccountNameData.otp) } }
          );
          break;
        case USSDOperations.Payment:
          if (!ussdSplitted[1]) {
            message = `To make a Payment, send the follow message 'PAYMENT <space> {MERCHANT_CODE} <space> {AMOUNT}'`;
            SMSService.sendCustomerNotification(phoneNumber, message, system, getAccountNameData.otp);
            throw new UserFacingError('OPERATION_ERROR - Missing merchant code');
          }

          if (!ussdSplitted[2]) {
            message = `To make a Payment, send the follow message 'PAYMENT <space> {MERCHANT_CODE} <space> {AMOUNT}'`;
            SMSService.sendCustomerNotification(phoneNumber, message, system, getAccountNameData.otp);
            throw new UserFacingError('OPERATION_ERROR - Missing amount value');
          }

          SMSService.validateAmount(ussdSplitted[2], phoneNumber, system, getAccountNameData.otp);

          if (getAccountNameData.active) {
            tokenApiResponse = await axios.get(`${process.env.TOKEN_API_URL}/tokens/${phoneNumber}`);
            identifier = tokenApiResponse.data.token;
            identifierType = 'token';
          } else {
            identifier = phoneNumber;
            identifierType = 'phoneNumber';
          }

          const operationMerchantPaymentObj: Operation = {
            type: 'merchant-payment',
            amount: Number(ussdSplitted[2]),
            system,
            identifier,
            identifierType,
            merchantCode: ussdSplitted[1],
            customerInfo: getAccountNameData,
          };

          try {
            await OperationsService.manageOperation('accept', operationMerchantPaymentObj);
          } catch (err: any | AxiosError) {
            if (err.name === 'NotFoundError') {
              message = `Doesn't exist any merchant available with that code`;
              SMSService.sendCustomerNotification(phoneNumber, message, system, getAccountNameData.otp);
            }
            catchError(err);
          }

          break;
        default:
          message = `Thank you for using the Tokenisation Solution from Inclusive Tech Lab. Please, send a valid operation code/message.`;
          SMSService.sendCustomerNotification(phoneNumber, message, system, getAccountNameData.otp);
          throw new UserFacingError('OPERATION_ERROR - Invalid operation');
      }
    } catch (err: any | AxiosError) {
      catchError(err);
    }
  }
}

const ussdService = new USSDService();
export { ussdService as USSDService };
