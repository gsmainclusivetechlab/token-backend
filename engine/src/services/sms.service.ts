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
import { TransactionsService } from './transactions.service';

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
      operation = operation.toUpperCase();

      if (!(operation === SMSOperations.Payment || operation === SMSOperations.Pin)) {
        if (smsSplitted[1]) {
          operation += ' ' + smsSplitted[1];
          operation = operation.toUpperCase();
        }
      }
      
      //
      const getTransactionResponse = await TransactionsService.getTransaction(phoneNumber, 'pending', String(getAccountNameData.otp));
      var pendingTransaction = getTransactionResponse.transaction;

      switch (operation) {
        case SMSOperations.GetToken:
          if (pendingTransaction) {
            await TransactionsService.deletePendingTransaction(pendingTransaction, getAccountNameData.otp);
          }

          if (smsSplitted.length > 2) {
            this.invalidOperation(phoneNumber, system, getAccountNameData);
          }

          OperationsService.getToken(phoneNumber, system, getAccountNameData);
          break;
        case SMSOperations.DeleteToken:
          if (pendingTransaction) {
            await TransactionsService.deletePendingTransaction(pendingTransaction, getAccountNameData.otp);
          }

          if (smsSplitted.length > 2) {
            this.invalidOperation(phoneNumber, system, getAccountNameData);
          }

          OperationsService.deleteToken(phoneNumber, system, getAccountNameData);
          break;
        case SMSOperations.CashIn:
          if (pendingTransaction) {
            await TransactionsService.deletePendingTransaction(pendingTransaction, getAccountNameData.otp);
          }

          if (smsSplitted.length > 3) {
            this.invalidOperation(phoneNumber, system, getAccountNameData);
          }

          if (!smsSplitted[2]) {
            message = `To make a cash-in, send the following message 'CASH IN <space> {AMOUNT}'`;
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
            createdBy: 'customer',
            createdUsing: 'SMS',
          };

          await OperationsService.sendOperationToMMO(phoneNumber, operationCashInObj);
          message = `To proceed with the cash-in operation, send the following message 'PIN 1234'`;
          this.sendCustomerNotification(phoneNumber, message, system, getAccountNameData.otp);

          break;
        case SMSOperations.CashOut:
          if (pendingTransaction) {
            await TransactionsService.deletePendingTransaction(pendingTransaction, getAccountNameData.otp);
          }

          if (smsSplitted.length > 3) {
            this.invalidOperation(phoneNumber, system, getAccountNameData);
          }

          if (!smsSplitted[2]) {
            message = `To make a cash-out, send the following message 'CASH OUT <space> {AMOUNT}'`;
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

          const operationCashOutObj: Operation = {
            type: 'cash-out',
            amount: Number(smsSplitted[2]),
            system,
            identifier,
            identifierType,
            customerInfo: getAccountNameData,
            createdBy: 'customer',
            createdUsing: 'SMS',
          };

          await OperationsService.sendOperationToMMO(phoneNumber, operationCashOutObj);
          message = `To proceed with the cash-out operation, send the following message 'PIN 1234'`;
          this.sendCustomerNotification(phoneNumber, message, system, getAccountNameData.otp);
          break;
        case SMSOperations.Pin:
          if (pendingTransaction && pendingTransaction.createdUsing != 'SMS') {
            await TransactionsService.deletePendingTransaction(pendingTransaction, getAccountNameData.otp);
            pendingTransaction = null;
          }

          if (smsSplitted.length > 2) {
            if (pendingTransaction) {
              await TransactionsService.deletePendingTransaction(pendingTransaction, getAccountNameData.otp);
            }

            this.invalidOperation(phoneNumber, system, getAccountNameData);
          }

          if (!smsSplitted[1]) {
            if (pendingTransaction) {
              await TransactionsService.deletePendingTransaction(pendingTransaction, getAccountNameData.otp);
            }

            message = `To send the pin, send the following message 'PIN <space> {VALUE}'`;
            this.sendCustomerNotification(phoneNumber, message, system, getAccountNameData.otp);
            throw new UserFacingError('OPERATION_ERROR - Missing pin value');
          }

          if (pendingTransaction) {
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
                  const operationType: OperationType = GetOperationFromType(pendingTransaction.type);
                  
                  if(pendingTransaction.identifierType === 'token'){
                    tokenApiResponse = await axios.get(`${process.env.TOKEN_API_URL}/tokens/${phoneNumber}`);
                    identifier = tokenApiResponse.data.token;
                  } else {
                    identifier = phoneNumber;
                  }

                  message = `Wrong PIN number. The ${operationType} operation with value ${pendingTransaction.amount} for the customer with the identifier ${identifier} was rejected by the Customer`;
                  this.sendCustomerNotification(phoneNumber, message, system, getAccountNameData.otp);
                  if (pendingTransaction.createdBy !== 'customer') {
                    HooksService.sendAgentMerchantNotification(message, getAccountNameData.otp);
                  }
                }
              }
              catchError(err);
            }
          } else {
            message = `You don't have any transaction awaiting for a pin`;
            this.sendCustomerNotification(phoneNumber, message, system, getAccountNameData.otp);
          }

          break;
        case SMSOperations.Payment:
          if (pendingTransaction) {
            await TransactionsService.deletePendingTransaction(pendingTransaction, getAccountNameData.otp);
          }

          if (smsSplitted.length > 3) {
            this.invalidOperation(phoneNumber, system, getAccountNameData);
          }

          if (!smsSplitted[1]) {
            message = `To make a payment, send the following message 'PAYMENT <space> {MERCHANT_CODE} <space> {AMOUNT}'`;
            this.sendCustomerNotification(phoneNumber, message, system, getAccountNameData.otp);
            throw new UserFacingError('OPERATION_ERROR - Missing merchant code');
          }

          if (!smsSplitted[2]) {
            message = `To make a payment, send the following message 'PAYMENT <space> {MERCHANT_CODE} <space> {AMOUNT}'`;
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
            createdBy: 'customer',
            createdUsing: 'SMS',
          };

          try {
            await OperationsService.sendOperationToMMO(phoneNumber, operationMerchantPaymentObj);
          } catch (err: any | AxiosError) {
            if (err.name === 'NotFoundError') {
              message = `Doesn't exist any merchant available with that code`;
              this.sendCustomerNotification(phoneNumber, message, system, getAccountNameData.otp);
            }
            catchError(err);
          }

          message = `To proceed with the merchant-payment operation, send the following message 'PIN 1234'`;
          this.sendCustomerNotification(phoneNumber, message, system, getAccountNameData.otp);

          break;
        default:
          if (pendingTransaction) {
            await TransactionsService.deletePendingTransaction(pendingTransaction, getAccountNameData.otp);
          }
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
