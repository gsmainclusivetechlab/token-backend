import axios, { AxiosError } from 'axios';
import { UserFacingError } from '../classes/errors';
import { SMSOperations } from '../enum/sms-operations.enum';
import { IdentifierType, Operation, OperationType, SystemType } from '../interfaces/operation';
import { OperationsService } from './operations.service';
import { AccountsService } from './accounts.service';
import { HooksService } from './hooks.service';
import { catchError } from '../utils/catch-error';
import { SMSWebhookBody } from '../interfaces/hook';
import { AccountNameReturn } from '../interfaces/mmo';
import { GetOperationFromType } from '../lib/operations';

class SMSService {
  async processSMSMessage(obj: SMSWebhookBody) {
    try {
      const { phoneNumber, text, system } = obj;

      //Check if phone number is registry
      const getAccountNameData: AccountNameReturn = await AccountsService.getAccountInfo(phoneNumber);

      var message: string = '';

      var smsSplitted: string[] = text.split(' ');
      if (smsSplitted.length === 0) {
        message = `Thank you for using the Tokenisation Solution from Inclusive Tech Lab. Please, send a valid operation code/message.`;
        this.sendCustomerNotification(phoneNumber, message, system, getAccountNameData.otp);
        throw new UserFacingError('OPERATION_ERROR - Missing operation');
      }

      var tokenApiResponse = null;
      var identifier = null;
      var identifierType: IdentifierType | undefined = undefined;

      let operation = smsSplitted[0];

      if (!(operation === SMSOperations.Payment || operation === SMSOperations.Pin)) {
        if (smsSplitted[1]) {
          operation += ' ' + smsSplitted[1];
        }
      }

      operation = operation.toUpperCase();

      switch (operation) {
        case SMSOperations.GetToken:
          if(smsSplitted.length > 2){
            this.invalidOperation(phoneNumber, system, getAccountNameData);
          }

          OperationsService.getToken(phoneNumber, system, getAccountNameData);
          break;
        case SMSOperations.DeleteToken:
          if(smsSplitted.length > 2){
            this.invalidOperation(phoneNumber, system, getAccountNameData);
          }

          OperationsService.deleteToken(phoneNumber, system, getAccountNameData);
          break;
        case SMSOperations.CashIn:
          if(smsSplitted.length > 3){
            this.invalidOperation(phoneNumber, system, getAccountNameData);
          }

          if (!smsSplitted[2]) {
            message = `To make a CASH IN, send the following message 'CASH IN <space> {AMOUNT}'`;
            this.sendCustomerNotification(phoneNumber, message, system, getAccountNameData.otp);
            throw new UserFacingError('OPERATION_ERROR - Missing amount value');
          }

          this.validateAmount(smsSplitted[2], phoneNumber, system, getAccountNameData.otp);

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
            amount: Number(smsSplitted[2]),
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
        case SMSOperations.CashOut:
          if(smsSplitted.length > 3){
            this.invalidOperation(phoneNumber, system, getAccountNameData);
          }

          if (!smsSplitted[2]) {
            message = `To make a CASH OUT, send the following message 'CASH OUT <space> {AMOUNT}'`;
            this.sendCustomerNotification(phoneNumber, message, system, getAccountNameData.otp);
            throw new UserFacingError('OPERATION_ERROR - Missing amount value');
          }

          this.validateAmount(smsSplitted[1], phoneNumber, system, getAccountNameData.otp);

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
            amount: Number(smsSplitted[2]),
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
        case SMSOperations.Pin:
          if(smsSplitted.length > 2){
            this.invalidOperation(phoneNumber, system, getAccountNameData);
          }

          if (!smsSplitted[1]) {
            message = `To send the pin, send the following message 'PIN <space> {VALUE}'`;
            this.sendCustomerNotification(phoneNumber, message, system, getAccountNameData.otp);
            throw new UserFacingError('OPERATION_ERROR - Missing pin value');
          }

          const transaction = await axios.get(`${process.env.MMO_API_URL}/transactions/${phoneNumber}/pending`, {
            headers: { sessionId: String(getAccountNameData.otp) },
          });

          try {
            await axios.post(
              `${process.env.MMO_API_URL}/accounts/authorize`,
              {
                pin: smsSplitted[1],
                phoneNumber,
              },
              { headers: { sessionId: String(getAccountNameData.otp) } }
            );
          } catch (err: any | AxiosError) {
            if (axios.isAxiosError(err)) {
              if (err.response?.status === 401) {
                const operationType: OperationType = GetOperationFromType(transaction.data.type);
                message = `Wrong PIN number. The ${operationType} operation with value ${transaction.data.amount} was rejected`;
                HooksService.sendAgentMerchantNotification(message, getAccountNameData.otp);
                this.sendCustomerNotification(phoneNumber, message, system, getAccountNameData.otp);
              }
            }
            catchError(err);
          }
          break;
        case SMSOperations.Payment:
          if(smsSplitted.length > 3){
            this.invalidOperation(phoneNumber, system, getAccountNameData);
          }

          if (!smsSplitted[1]) {
            message = `To make a Payment, send the following message 'PAYMENT <space> {MERCHANT_CODE} <space> {AMOUNT}'`;
            this.sendCustomerNotification(phoneNumber, message, system, getAccountNameData.otp);
            throw new UserFacingError('OPERATION_ERROR - Missing merchant code');
          }

          if (!smsSplitted[2]) {
            message = `To make a Payment, send the following message 'PAYMENT <space> {MERCHANT_CODE} <space> {AMOUNT}'`;
            this.sendCustomerNotification(phoneNumber, message, system, getAccountNameData.otp);
            throw new UserFacingError('OPERATION_ERROR - Missing amount value');
          }

          this.validateAmount(smsSplitted[2], phoneNumber, system, getAccountNameData.otp);

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
            amount: Number(smsSplitted[2]),
            system,
            identifier,
            identifierType,
            merchantCode: smsSplitted[1],
            customerInfo: getAccountNameData,
          };

          try {
            await OperationsService.manageOperation('accept', operationMerchantPaymentObj);
          } catch (err: any | AxiosError) {
            if (err.name === 'NotFoundError') {
              message = `Doesn't exist any merchant available with that code`;
              this.sendCustomerNotification(phoneNumber, message, system, getAccountNameData.otp);
            }
            catchError(err);
          }

          break;
        default:
          this.invalidOperation(phoneNumber, system, getAccountNameData);
      }
      return { message: 'Thanks for using Engine API' };
    } catch (err: any | AxiosError) {
      catchError(err);
    }
  }

  sendCustomerNotification(phoneNumber: string, message: string, system: SystemType, otp: number) {
    axios.post(
      process.env.SMS_GATEWAY_API_URL + '/receive',
      {
        phoneNumber,
        message,
        system,
      },
      { headers: { sessionId: String(otp) } }
    );
  }

  validateAmount(amount: string, phoneNumber: string, system: SystemType, otp: number) {
    var amountParsed = Number(amount);
    var message: string = '';

    if (isNaN(amountParsed)) {
      message = `The amount needs to be a number`;
      this.sendCustomerNotification(phoneNumber, message, system, otp);
      throw new UserFacingError('OPERATION_ERROR - The amount needs to be a number');
    }

    if (amountParsed > 500) {
      message = `The amount can't be greater than 500`;
      this.sendCustomerNotification(phoneNumber, message, system, otp);
      throw new UserFacingError(`OPERATION_ERROR - The amount can't be greater than 500`);
    }
  }

  private invalidOperation(phoneNumber: string, system: SystemType, getAccountNameData: AccountNameReturn) {
    const message = `Thank you for using the Tokenisation Solution from Inclusive Tech Lab. Please, send a valid operation code/message.`;
    this.sendCustomerNotification(phoneNumber, message, system, getAccountNameData.otp);
    throw new UserFacingError('OPERATION_ERROR - Invalid operation');
  }
}

const smsService = new SMSService();
export { smsService as SMSService };
