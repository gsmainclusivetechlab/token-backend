import axios, { AxiosError } from 'axios';
import { UserFacingError } from '../classes/errors';
import { AccountNameReturn } from '../interfaces/mmo';
import SafeAwait from '../lib/safe-await';
import { v4 as uuidv4 } from 'uuid';
import { LogLevels, logService } from './log.service';
import { MessageService } from './message.service';
import { Action, CreateOperationBody, OperationType, CreateOperation, OperationNotification } from '../interfaces/operations';

class OperationsService {
  operations: CreateOperation[] = [];
  notifications: OperationNotification[] = [];
  // async getAccountInfo(
  //   amount: string,
  //   token: string,
  //   type: Operation,
  //   system: System
  // ) {
  //   if (!(type === 'cash-in' || type === 'cash-out')) {
  //     throw new UserFacingError('Invalid type');
  //   }

  //   if (!(system === 'mock' || system === 'live')) {
  //     throw new UserFacingError('Invalid system');
  //   }

  //   const [accountInfoError, accountInfoData] = await SafeAwait(
  //     axios.get<AccountNameReturn>(
  //       `${process.env.ENGINE_API_URL}/operations/account-info`,
  //       { params: { token, amount } }
  //     )
  //   );
  //   if (accountInfoError) {
  //     throw new UserFacingError(accountInfoError.response.data.error);
  //   }
  //   this.setOperation(type, token, accountInfoData.data, system);
  //   return accountInfoData.data;
  // }

  async createOperation(elem: CreateOperationBody) {
    //TODO
    // if (!(elem.type === 'cash-in' || elem.type === 'cash-out')) {
    //   throw new UserFacingError('Invalid type');
    // }

    if (!(elem.system === 'mock' || elem.system === 'live')) {
      throw new UserFacingError('Invalid system');
    }

    const [accountInfoError, accountInfoData] = await SafeAwait(axios.get(`${process.env.ENGINE_API_URL}/accounts/${elem.identifier}`));
    if (accountInfoError) {
      throw new UserFacingError(accountInfoError.response.data.error);
    }

    elem.identifierType = elem.identifier === accountInfoData.data.phoneNumber ? 'phoneNumber' : 'token';
    elem.customerInfo = { ...accountInfoData.data };

    this.setOperation(elem);

    return elem;
  }

  async manageOperation(action: Action, operationId: string) {
    try {
      if (!(action === 'accept' || action === 'reject')) {
        throw new UserFacingError('Invalid action');
      }
      const operation = this.findOperationById(operationId);
      // if (!operation) {
      //   throw new UserFacingError('Something went wrong');
      // }

      if (!operation) {
        throw new UserFacingError("Operation doesn't exist");
      }

      const response = await axios.post(`${process.env.ENGINE_API_URL}/operations/${action}`, { ...operation });

      this.operations.splice(
        this.operations.findIndex((el: CreateOperation) => el.id === operationId),
        1
      );

      return response.data;
    } catch (err: any | AxiosError) {
      if (axios.isAxiosError(err) && err.response) {
        logService.log(LogLevels.ERROR, err.response?.data?.error);
        throw new UserFacingError(err.response?.data?.error);
      } else {
        logService.log(LogLevels.ERROR, err.message);
        throw new UserFacingError(err.message);
      }
    }
  }

  async getOperationsAndNotificationsToAgent() {
    const operationTypes: OperationType[] = ['cash-in', 'cash-out'];
    return {
      operations: this.filterOperationsByTypes(operationTypes),
      notifications: this.filterNotificationsByTypes(operationTypes),
    };
  }

  async getOperationsAndNotificationsToMerchant() {
    const operationTypes: OperationType[] = ['merchant-payment'];

    return {
      operations: this.filterOperationsByTypes(operationTypes),
      notifications: this.filterNotificationsByTypes(operationTypes),
    };
  }

  async createNotification(elem: OperationNotification) {
    elem.id = uuidv4();
    this.notifications.push({
      ...elem,
    });
  }

  //TODO Refactor
  // async createOperation(body: CreateOperationBody) {
  //   this.sendOperation.operations.push({
  //     ...body,
  //     id: uuidv4()
  //   });
  // }

  async registerOperation(elem: CreateOperationBody) {
    this.setOperation(elem);
  }

  async deleteNotification(id: string) {
    //TODO Validar se a notificação exist
    // this.sendOperation.notifications.splice(
    //   this.sendOperation.notifications.findIndex((el) => el.id === id),
    //   1
    // );
    // return { message: `The notification with id ${id} was deleted` };
  }

  private setOperation(operation: CreateOperationBody) {
    this.operations.push({
      id: uuidv4(),
      ...operation,
    });
  }

  private findOperationById(id: string) {
    return this.operations.find((el: CreateOperation) => el.id === id);
  }

  private findNotificationById(id: string) {
    return this.notifications.find((el: OperationNotification) => el.id === id);
  }

  private filterOperationsByTypes(operationTypes: OperationType[]) {
    return this.operations.filter((el: CreateOperation) => operationTypes.includes(el.type));
  }

  private filterNotificationsByTypes(operationTypes: OperationType[]) {
    return this.notifications.filter((el: OperationNotification) => operationTypes.includes(el.operationType));
  }
}

const operationsService = new OperationsService();
export { operationsService as OperationsService };
