import axios, { AxiosError } from 'axios';
import { UserFacingError } from '../classes/errors';
import { USSDOperations } from '../enum/ussd-operations.enum';
import { USSDWebhookBody } from '../interfaces/hook';
import { OperationsService } from './operations.service';
import { AccountsService } from './accounts.service';
import { SMSService } from './sms.service';
import { catchError } from '../utils/catch-error';
import { IdentifierType, Operation, OperationType, SystemType } from '../interfaces/operation';
import { GetOperationFromType } from '../lib/operations';
import { HooksService } from './hooks.service';
import { TransactionsService } from './transactions.service';
import { AccountNameReturn } from '../interfaces/mmo';

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

      const getTransactionResponse = await TransactionsService.getTransaction(phoneNumber, 'pending', String(getAccountNameData.otp));
      var pendingTransaction = getTransactionResponse.transaction;

      switch (ussdSplitted[0]) {
        case USSDOperations.GetToken:
          if (pendingTransaction) {
            await TransactionsService.deletePendingTransaction(pendingTransaction, getAccountNameData.otp);
          }

          if (ussdSplitted.length > 2) {
            this.invalidOperation(phoneNumber, system, getAccountNameData);
          }

          OperationsService.getToken(phoneNumber, system, getAccountNameData);
          break;
        case USSDOperations.DeleteToken:
          if (pendingTransaction) {
            await TransactionsService.deletePendingTransaction(pendingTransaction, getAccountNameData.otp);
          }

          if (ussdSplitted.length > 2) {
            this.invalidOperation(phoneNumber, system, getAccountNameData);
          }

          OperationsService.deleteToken(phoneNumber, system, getAccountNameData);
          break;
        case USSDOperations.CashIn:
          if (pendingTransaction) {
            await TransactionsService.deletePendingTransaction(pendingTransaction, getAccountNameData.otp);
          }

          if (ussdSplitted.length > 3) {
            this.invalidOperation(phoneNumber, system, getAccountNameData);
          }

          if (!ussdSplitted[1]) {
            if (system === 'live') {
              message = `To make a cash-in, send the following message '*165#*3*{AMOUNT}*{PIN}'`;
              SMSService.sendCustomerNotification(phoneNumber, message, system, getAccountNameData.otp);
            }
            throw new UserFacingError('OPERATION_ERROR - Missing amount value');
          }

          if (!ussdSplitted[2]) {
            if (system === 'live') {
              message = `To make a cash-in, send the following message '*165#*3*{AMOUNT}*{PIN}'`;
              SMSService.sendCustomerNotification(phoneNumber, message, system, getAccountNameData.otp);
            }
            throw new UserFacingError('OPERATION_ERROR - Missing PIN');
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
            createdBy: 'customer',
            createdUsing: 'USSD'
          };

          OperationsService.sendOperationToMMO(phoneNumber, operationCashInObj);

          try {
            await axios.post(
              `${process.env.MMO_API_URL}/accounts/authorize`,
              {
                pin: ussdSplitted[2],
                phoneNumber,
              },
              { headers: { sessionId: String(getAccountNameData.otp) } }
            );
          } catch (err: any | AxiosError) {
            if (axios.isAxiosError(err)) {
              if (err.response?.status === 401) {
                message = `Wrong PIN number. The cash-in operation with value ${ussdSplitted[1]} was rejected by the Customer`;
                SMSService.sendCustomerNotification(phoneNumber, message, system, getAccountNameData.otp);
              }
            }
            catchError(err);
          }

          break;
        case USSDOperations.CashOut:
          if (pendingTransaction) {
            await TransactionsService.deletePendingTransaction(pendingTransaction, getAccountNameData.otp);
          }

          if (ussdSplitted.length > 3) {
            this.invalidOperation(phoneNumber, system, getAccountNameData);
          }

          if (!ussdSplitted[1]) {
            if (system === 'live') {
              message = `To make a cash-out, send the following message '*165#*4*{AMOUNT}*{PIN}'`;
              SMSService.sendCustomerNotification(phoneNumber, message, system, getAccountNameData.otp);
            }
            throw new UserFacingError('OPERATION_ERROR - Missing amount value');
          }

          if (!ussdSplitted[2]) {
            if (system === 'live') {
              message = `To make a cash-out, send the following message '*165#*4*{AMOUNT}*{PIN}'`;
              SMSService.sendCustomerNotification(phoneNumber, message, system, getAccountNameData.otp);
            }
            throw new UserFacingError('OPERATION_ERROR - Missing PIN');
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
            createdBy: 'customer',
            createdUsing: 'USSD'
          };

          OperationsService.sendOperationToMMO(phoneNumber, operationCashOutObj);

          try {
            await axios.post(
              `${process.env.MMO_API_URL}/accounts/authorize`,
              {
                pin: ussdSplitted[2],
                phoneNumber,
              },
              { headers: { sessionId: String(getAccountNameData.otp) } }
            );
          } catch (err: any | AxiosError) {
            if (axios.isAxiosError(err)) {
              if (err.response?.status === 401) {
                message = `Wrong PIN number. The cash-out operation with value ${ussdSplitted[2]} was rejected by the Customer`;
                SMSService.sendCustomerNotification(phoneNumber, message, system, getAccountNameData.otp);
              }
            }
            catchError(err);
          }
          break;
        case USSDOperations.Payment:
          if (pendingTransaction) {
            await TransactionsService.deletePendingTransaction(pendingTransaction, getAccountNameData.otp);
          }

          if (ussdSplitted.length > 4) {
            this.invalidOperation(phoneNumber, system, getAccountNameData);
          }

          if (!ussdSplitted[1]) {
            if (system === 'live') {
              message = `To make a payment, send the following message '*165#*5*{MERCHANT_CODE}*{AMOUNT}*{PIN}'`;
              SMSService.sendCustomerNotification(phoneNumber, message, system, getAccountNameData.otp);
            }
            throw new UserFacingError('OPERATION_ERROR - Missing merchant code');
          }

          if (!ussdSplitted[2]) {
            if (system === 'live') {
              message = `To make a payment, send the following message '*165#*5*{MERCHANT_CODE}*{AMOUNT}*{PIN}'`;
              SMSService.sendCustomerNotification(phoneNumber, message, system, getAccountNameData.otp);
            }
            throw new UserFacingError('OPERATION_ERROR - Missing amount value');
          }

          if (!ussdSplitted[3]) {
            if (system === 'live') {
              message = `To make a payment, send the following message '*165#*5*{MERCHANT_CODE}*{AMOUNT}*{PIN}'`;
              SMSService.sendCustomerNotification(phoneNumber, message, system, getAccountNameData.otp);
            }
            throw new UserFacingError('OPERATION_ERROR - Missing pin value');
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
            createdBy: 'customer',
            createdUsing: 'USSD'
          };

          try {
            await OperationsService.sendOperationToMMO(phoneNumber, operationMerchantPaymentObj);
          } catch (err: any | AxiosError) {
            if (err.name === 'NotFoundError') {
              message = `Doesn't exist any merchant available with that code`;
              SMSService.sendCustomerNotification(phoneNumber, message, system, getAccountNameData.otp);
            }
            catchError(err);
          }

          try {
            await axios.post(
              `${process.env.MMO_API_URL}/accounts/authorize`,
              {
                pin: ussdSplitted[3],
                phoneNumber,
              },
              { headers: { sessionId: String(getAccountNameData.otp) } }
            );
          } catch (err: any | AxiosError) {
            if (axios.isAxiosError(err)) {
              if (err.response?.status === 401) {
                message = `Wrong PIN number. The payment operation with value ${ussdSplitted[2]} was rejected by the Customer`;
                SMSService.sendCustomerNotification(phoneNumber, message, system, getAccountNameData.otp);
              }
            }
            catchError(err);
          }

          break;
        case USSDOperations.Pin:
          if (pendingTransaction && pendingTransaction.createdUsing != 'USSD') {
            await TransactionsService.deletePendingTransaction(pendingTransaction, getAccountNameData.otp);
            pendingTransaction = null;
          }

          if (ussdSplitted.length > 2) {
            if (pendingTransaction) {
              await TransactionsService.deletePendingTransaction(pendingTransaction, getAccountNameData.otp);
            }

            this.invalidOperation(phoneNumber, system, getAccountNameData);
          }

          if (!ussdSplitted[1]) {
            if (pendingTransaction) {
              await TransactionsService.deletePendingTransaction(pendingTransaction, getAccountNameData.otp);
            }

            message = `To send the pin, send the following message '*165#*6*1234'`;
            SMSService.sendCustomerNotification(phoneNumber, message, system, getAccountNameData.otp);
            throw new UserFacingError('OPERATION_ERROR - Missing pin value');
          }

          if (pendingTransaction) {
            try {
              await axios.post(
                `${process.env.MMO_API_URL}/accounts/authorize`,
                {
                  pin: ussdSplitted[1],
                  phoneNumber,
                },
                { headers: { sessionId: String(getAccountNameData.otp) } }
              );
            } catch (err: any | AxiosError) {
              if (axios.isAxiosError(err)) {
                if (err.response?.status === 401) {
                  const operationType: OperationType = GetOperationFromType(pendingTransaction.type);
                  
                  var identifier = null;
                  if(pendingTransaction.identifierType === 'token'){
                    tokenApiResponse = await axios.get(`${process.env.TOKEN_API_URL}/tokens/${phoneNumber}`);
                    identifier = tokenApiResponse.data.token;
                  } else {
                    identifier = phoneNumber;
                  }

                  message = `Wrong PIN number. The ${operationType} operation with value ${pendingTransaction.amount} for the customer with the identifier ${identifier} was rejected by the Customer`;
                  SMSService.sendCustomerNotification(phoneNumber, message, system, getAccountNameData.otp);
                  if (pendingTransaction.createdBy !== 'customer') {
                    HooksService.sendAgentMerchantNotification(message, getAccountNameData.otp);
                  }
                }
              }
              catchError(err);
            }
          } else {
            message = `You don't have any transaction awaiting for a pin`;
            SMSService.sendCustomerNotification(phoneNumber, message, system, getAccountNameData.otp);
          }
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

  private invalidOperation(phoneNumber: string, system: SystemType, getAccountNameData: AccountNameReturn) {
    const message = `Thank you for using the Tokenisation Solution from Inclusive Tech Lab. Please, send a valid operation code/message.`;
    SMSService.sendCustomerNotification(phoneNumber, message, system, getAccountNameData.otp);
    throw new UserFacingError('OPERATION_ERROR - Invalid operation');
  }
}

const ussdService = new USSDService();
export { ussdService as USSDService };
