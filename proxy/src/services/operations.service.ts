import axios, { AxiosError } from 'axios';
import { NotFoundError, UserFacingError } from '../classes/errors';
import { AccountNameReturn } from '../interfaces/mmo';
import SafeAwait from '../lib/safe-await';
import { v4 as uuidv4 } from 'uuid';
import { LogLevels, logService } from './log.service';
import { MessageService } from './message.service';
import { Action, CreateOperationBody, OperationType, CreateOperation, OperationNotification } from '../interfaces/operations';

class OperationsService {
  operations: CreateOperation[] = [];
  notifications: OperationNotification[] = [];

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

  async getOperationsAndNotifications() {
    return {
      operations: this.operations,
      notifications: this.notifications,
    };
  }

  async createNotification(elem: OperationNotification) {
    elem.id = uuidv4();
    this.notifications.push({
      ...elem,
    });
  }

  async registerOperation(elem: CreateOperationBody) {
    this.setOperation(elem);
  }

  async deleteNotification(id: string) {
    const index = this.findIndexNotificationById(id);
    if (index === -1) {
      throw new NotFoundError(`The notification with id ${id} doesn't exist.`);
    } else {
      this.notifications.splice(index, 1);
      return { message: `The notification with id ${id} was deleted` };
    }
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

  private findIndexNotificationById(id: string) {
    return this.notifications.findIndex((el: OperationNotification) => el.id === id);
  }
}

const operationsService = new OperationsService();
export { operationsService as OperationsService };
