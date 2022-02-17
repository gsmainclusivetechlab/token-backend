import axios, { AxiosError } from 'axios';
import { Operation, Action, SystemType } from '../interfaces/operation';
import { UserFacingError } from '../classes/errors';
import { GetTypeFromOperation } from '../lib/operations';
import { AccountsService } from './accounts.service';
import { SMSService } from './sms.service';
import { HooksService } from './hooks.service';
import { catchError } from '../utils/catch-error';
import { AccountNameReturn } from '../interfaces/mmo';
import { TransactionsService } from './transactions.service';

class OperationsService {
  async manageOperation(action: Action, operation: Operation) {
    try {
      this.validateBody(action, operation);

      const getAccountNameData = await AccountsService.getAccountInfo(operation.identifier);
      operation.identifierType = operation.identifier === getAccountNameData.phoneNumber ? 'phoneNumber' : 'token';

      if (operation.identifierType === 'token' && !getAccountNameData.active) {
        throw new UserFacingError(`A customer with this mobile number or token does not exist.`);
      }

      let phoneNumber = getAccountNameData.phoneNumber;

      if (action === 'accept') {
        if (operation.createdBy === 'customer') {
          const message = `The ${operation.type} operation with the value of ${operation.amount} for the customer with the identifier ${operation.identifier} was successful`;
          HooksService.sendAgentMerchantNotification(message, getAccountNameData.otp);
          SMSService.sendCustomerNotification(phoneNumber, message, operation.system, getAccountNameData.otp);
          return { status: 'accepted' };
        } else {
          const getTransactionResponse = await TransactionsService.getTransaction(phoneNumber, 'pending', String(getAccountNameData.otp));
          if (getTransactionResponse.transaction) {
            throw new UserFacingError('There is a pending transaction for this customer');
          }

          await this.sendOperationToMMO(phoneNumber, operation);
          var messageAskingForPin = `To proceed with the ${operation.type} operation, send the following message `;

          if (operation.createdUsing === 'SMS') {
            messageAskingForPin += `PIN 1234`;
          } else {
            messageAskingForPin += `*165#*6*1234`;
          }

          SMSService.sendCustomerNotification(phoneNumber, messageAskingForPin, operation.system, operation.customerInfo.otp);

          return { status: 'pending' };
        }
      } else {
        if (operation.createdBy !== 'customer') {
          const getTransactionResponse = await TransactionsService.getTransaction(phoneNumber, 'pending', String(getAccountNameData.otp));
          if (getTransactionResponse.transaction) {
            throw new UserFacingError('There is a pending transaction for this customer');
          }
        }

        var message = `The ${operation.type} operation with the value of ${operation.amount} for the customer with the identifier ${operation.identifier} was rejected`;

        switch (operation.type) {
          case 'cash-in':
          case 'cash-out':
            message += ' by the Agent';
            break;
          case 'merchant-payment':
            message += ' by the Merchant';
            break;
          default:
            break;
        }

        HooksService.sendAgentMerchantNotification(message, operation.customerInfo.otp);
        if (operation.createdBy === 'customer') {
          SMSService.sendCustomerNotification(phoneNumber, message, operation.system, operation.customerInfo.otp);
        }
        return { status: 'rejected' };
      }
    } catch (err: any | AxiosError) {
      catchError(err);
    }
  }

  async getToken(phoneNumber: string, system: SystemType, getAccountNameData: AccountNameReturn) {
    const tokenApiResponse = await axios.get(`${process.env.TOKEN_API_URL}/tokens/renew/${phoneNumber}`);

    if (tokenApiResponse.data && tokenApiResponse.data.token) {
      const message = 'Your token is ' + tokenApiResponse.data.token;
      SMSService.sendCustomerNotification(phoneNumber, message, system, getAccountNameData.otp);
    }
  }

  async deleteToken(phoneNumber: string, system: SystemType, getAccountNameData: AccountNameReturn) {
    try {
      var message: string = '';
      if (!getAccountNameData.active) {
        message = `You need to request a new token to make that operation`;
        SMSService.sendCustomerNotification(phoneNumber, message, system, getAccountNameData.otp);
        throw new UserFacingError('OPERATION_ERROR - The user needs to have an active token to delete him');
      }

      const tokenApiResponse = await axios.get(`${process.env.TOKEN_API_URL}/tokens/invalidate/${phoneNumber}`);

      if (tokenApiResponse.data) {
        message = 'Your token was deleted';
        SMSService.sendCustomerNotification(phoneNumber, message, system, getAccountNameData.otp);
      }
    } catch (err: any | AxiosError) {
      if (axios.isAxiosError(err)) {
        if (err.response?.status === 404) {
          message = `You need to have an associated token to delete`;
          SMSService.sendCustomerNotification(phoneNumber, message, system, getAccountNameData.otp);
        }
      }
      catchError(err);
    }
  }

  async sendOperationToMMO(phoneNumber: string, operation: Operation) {
    const headers = {
      'X-Callback-URL': `${process.env.ENGINE_API_URL}/hooks/mmo`,
    };
    const body = {
      amount: operation.amount,
      debitParty: [
        {
          key: 'msisdn', // accountid
          value: phoneNumber, // 2999
        },
      ],
      creditParty: [
        {
          key: 'msisdn', // accountid
          value: phoneNumber, // 2999
        },
      ],
      currency: 'RWF', // RWF
      system: operation.system,
      merchantCode: operation.merchantCode,
      identifierType: operation.identifierType,
      otp: operation.customerInfo.otp,
      createdBy: operation.createdBy,
      createdUsing: operation.createdUsing,
    };

    await axios.post(`${process.env.MMO_API_URL}/transactions/type/${GetTypeFromOperation(operation.type)}`, body, { headers });
  }

  private validateBody(action: Action, operation: Operation) {
    if (!(action === 'accept' || action === 'reject')) {
      throw new UserFacingError('INVALID_REQUEST - Invalid action');
    }

    if (!operation) {
      throw new UserFacingError('INVALID_REQUEST - Missing object operation');
    }

    if (!(operation.type === 'cash-in' || operation.type === 'cash-out' || operation.type === 'merchant-payment')) {
      throw new UserFacingError('INVALID_REQUEST - Invalid type');
    }

    if (!(operation.system === 'mock' || operation.system === 'live')) {
      throw new UserFacingError('INVALID_REQUEST - Invalid System');
    }

    if (!operation.identifier) {
      throw new UserFacingError('INVALID_REQUEST - Missing customer identifier');
    }

    if (!operation.amount) {
      throw new UserFacingError('INVALID_REQUEST - Missing property amount');
    }

    if (operation.amount > 500) {
      throw new UserFacingError(`INVALID_REQUEST - The value of property amount can't be greater than 500`);
    }

    if (operation.type === 'merchant-payment') {
      if (!operation.merchantCode) {
        throw new UserFacingError('INVALID_REQUEST - Missing property merchantCode');
      }

      if (operation.merchantCode.trim() === '') {
        throw new UserFacingError("INVALID_REQUEST - Property merchantCode can't be empty");
      }
    }

    if (!(operation.createdBy === 'customer' || operation.createdBy === 'agent' || operation.createdBy === 'merchant')) {
      throw new UserFacingError('INVALID_REQUEST - Invalid created by value');
    }

    if (!(operation.createdUsing === 'SMS' || operation.createdUsing === 'USSD')) {
      throw new UserFacingError('INVALID_REQUEST - Invalid created using value');
    }
  }
}

const operationsService = new OperationsService();
export { operationsService as OperationsService };
