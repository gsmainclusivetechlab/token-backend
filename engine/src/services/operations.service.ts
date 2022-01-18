import axios, { AxiosError } from 'axios';
import { Operation, Action } from '../interfaces/operation';
import { UserFacingError } from '../classes/errors';
import { GetTypeFromOperation } from '../lib/operations';
import { AccountsService } from './accounts.service';
import { SMSService } from './sms.service';
import { HooksService } from './hooks.service';
import { catchError } from '../utils/catch-error';

class OperationsService {
  async manageOperation(action: Action, operation: Operation) {
    try {
      this.validateBody(action, operation);

      const getAccountNameData = await AccountsService.getAccountInfo(operation.identifier);
      operation.identifierType = operation.identifier === getAccountNameData.phoneNumber ? 'phoneNumber' : 'token';

      if (operation.identifierType === 'token' && !getAccountNameData.active) {
        throw new UserFacingError(`Doesn't exist any user with this phone number or token.`);
      }

      let phoneNumber = getAccountNameData.phoneNumber;

      if (action === 'accept') {
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
        };

        await axios.post(`${process.env.MMO_API_URL}/transactions/type/${GetTypeFromOperation(operation.type)}`, body, { headers });

        const message = `Please, to continue the operation send the following message 'PIN <space> {VALUE}'`;
        SMSService.sendCustomerNotification(phoneNumber, message, operation.system);

        return { status: 'pending' };
      } else {
        const message = `The ${operation.type} operation with the value of ${operation.amount} for the customer with the identifier ${operation.identifier} was rejected`;
        HooksService.sendAgentMerchantNotification(message);
        SMSService.sendCustomerNotification(phoneNumber, message, operation.system);

        return { status: 'reject' };
      }
    } catch (err: any | AxiosError) {
      catchError(err);
    }
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
  }
}

const operationsService = new OperationsService();
export { operationsService as OperationsService };
