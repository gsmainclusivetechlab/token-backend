import axios, { AxiosError } from 'axios';
import { Operation, Action, SystemType, OperationType } from '../interfaces/operation';
import { NotFoundError, UserFacingError } from '../classes/errors';
import { AccountNameReturn } from '../interfaces/mmo';
import { TokenDecodeInfo } from '../interfaces/token';
import { GetTypeFromOperation } from '../lib/operations';
import SafeAwait from '../lib/safe-await';
import { logService, LogLevels } from './log.service';
import { AccountsService } from './accounts.service';
import { SMSService } from './sms.service';
import { HooksService } from './hooks.service';

class OperationsService {
  async manageOperation(action: Action, operation: Operation) {
    try {
      if (!(action === 'accept' || action === 'reject')) {
        throw new UserFacingError('Invalid action');
      }

      if (!operation) {
        //TODO
        throw new UserFacingError('');
      }

      //TODO - Será possivel fazer isto melhor?
      if (!(operation.type === 'cash-in' || operation.type === 'cash-out' || operation.type === 'merchant-payment')) {
        throw new UserFacingError('Invalid type');
      }

      //TODO - Será possivel fazer isto melhor?
      if (!(operation.system === 'mock' || operation.system === 'live')) {
        throw new UserFacingError('Invalid System');
      }

      // if (!operation.token && !operation.phoneNumber) {
      //   //TODO
      //   throw new UserFacingError("");
      // }

      if (!operation.identifier) {
        //TODO
        throw new UserFacingError('');
      }

      const getAccountNameData = await AccountsService.getAccountInfo(operation.identifier);
      operation.identifierType = operation.identifier === getAccountNameData.phoneNumber ? 'phoneNumber' : 'token';

      let phoneNumber = null;

      if (operation.identifierType === 'token') {
        //TODO Avaliar se é necessário esta chamada
        // const [tokenError, tokenData] = await SafeAwait(
        //   axios.get<TokenDecodeInfo>(`${process.env.TOKEN_API_URL}/tokens/decode/${operation.identifier}`)
        // );
        // if (tokenError) {
        //   throw new UserFacingError(tokenError.error);
        // }
        // phoneNumber = tokenData.data.phoneNumber;

        phoneNumber = getAccountNameData.phoneNumber;
      } else {
        phoneNumber = operation.identifier;
      }

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

        const message = `Send a message with PIN <pin>`;
        SMSService.sendCustomerNotification(phoneNumber, message, operation.system);

        return { status: 'pending' };
      } else {
        //TODO operation type + amount + identifier
        const message = `operation: ${operation.type} + identifier: ${operation.identifier} + amount: ${operation.amount}`;

        //const message = `The operation of ${operation} was rejected`;

        HooksService.sendAgentMerchantNotification(message);
        SMSService.sendCustomerNotification(phoneNumber, message, operation.system);

        return { status: 'reject' };
      }
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
        throw new UserFacingError('OPERATION_ERROR - ' + err.message);
      }
    }
  }
}

const operationsService = new OperationsService();
export { operationsService as OperationsService };
