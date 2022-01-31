import axios, { AxiosError } from 'axios';
import { NotFoundError, UserFacingError } from '../classes/errors';
import SafeAwait from '../lib/safe-await';
import { v4 as uuidv4 } from 'uuid';
import { Action, CreateOperationBody, CreateOperation, OperationNotification } from '../interfaces/operations';
import { catchError } from '../utils/catch-error';
import { AccountsService } from './accounts.service';

class OperationsService {
  operations: CreateOperation[] = [];
  notifications: OperationNotification[] = [];

  async createOperation(elem: CreateOperationBody) {
    this.validateCreateOperationBody(elem);

    const [accountInfoError, accountInfoData] = await SafeAwait(axios.get(`${process.env.ENGINE_API_URL}/accounts/${elem.identifier}`));
    if (accountInfoError) {
      catchError(accountInfoError);
    }

    if (elem.type === 'merchant-payment') {
      const [merchantInfoError, merchantInfoData] = await SafeAwait(
        axios.get(`${process.env.ENGINE_API_URL}/accounts/merchant/${elem.merchantCode}`)
      );
      if (merchantInfoError) {
        catchError(merchantInfoError);
      }
    }

    elem.identifierType = elem.identifier === accountInfoData.data.phoneNumber ? 'phoneNumber' : 'token';
    if (elem.identifierType === 'token' && !accountInfoData.data.active) {
      throw new NotFoundError(`Doesn't exist any user with this phone number or token.`);
    }

    //TODO Validar se o sessionId que recebemos é o mesmo que está associado ao phoneNumber/Token

    elem.customerInfo = { ...accountInfoData.data };

    this.setOperation(elem);

    return elem;
  }

  async manageOperation(action: Action, operationId: string, otp: number) {
    try {
      if (!(action === 'accept' || action === 'reject')) {
        throw new UserFacingError('Invalid action');
      }
      const operation = this.findOperationByIdAndOTP(operationId, otp);

      if (!operation) {
        throw new NotFoundError(`The operation with id ${operationId} doesn't exist for this session id.`);
      }

      //TODO Validar se o sessionId que recebemos é o mesmo que está associado a operação

      const response = await axios.post(`${process.env.ENGINE_API_URL}/operations/${action}`, { ...operation });

      this.operations.splice(
        this.operations.findIndex((el: CreateOperation) => el.id === operationId),
        1
      );

      return response.data;
    } catch (err: any | AxiosError) {
      catchError(err);
    }
  }

  //TODO Passar para aqui o request e fazer as validacoes
  async getOperationsAndNotifications(otp: number) {
    AccountsService.updateSessionLastCall(otp);

    const operationsList = this.findOperationByOTP(otp);
    const notificationsList = this.findNotificationByOTP(otp);

    return {
      operations: operationsList ? operationsList : [],
      notifications: notificationsList ? notificationsList : [],
    };
  }

  async createNotification(elem: OperationNotification) {
    if (!elem.message) {
      throw new UserFacingError('INVALID_REQUEST - Missing property message');
    }

    elem.id = uuidv4();
    this.notifications.push({
      ...elem,
    });

    return { message: 'Notification created successfully' };
  }

  async registerOperation(elem: CreateOperationBody) {
    this.validateCreateOperationBody(elem);

    this.setOperation(elem);

    return { message: 'Operation registered successfully' };
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

  private findOperationByIdAndOTP(id: string, otp: number) {
    return this.operations.find((el: CreateOperation) => el.id === id && el.customerInfo.otp === otp);
  }

  private findIndexNotificationById(id: string) {
    return this.notifications.findIndex((el: OperationNotification) => el.id === id);
  }

  private validateCreateOperationBody(elem: CreateOperationBody) {
    if (!(elem.type === 'cash-in' || elem.type === 'cash-out' || elem.type === 'merchant-payment')) {
      throw new UserFacingError('INVALID_REQUEST - Invalid type');
    }

    if (!(elem.system === 'mock' || elem.system === 'live')) {
      throw new UserFacingError('INVALID_REQUEST - Invalid system');
    }

    if (!elem.identifier) {
      throw new UserFacingError('INVALID_REQUEST - Missing property text');
    }

    if (elem.identifier.trim() === '') {
      throw new UserFacingError("INVALID_REQUEST - Property identifier can't be empty");
    }

    if (!elem.amount) {
      throw new UserFacingError('INVALID_REQUEST - Missing property amount');
    }

    if (elem.amount > 500) {
      throw new UserFacingError(`INVALID_REQUEST - The value of property amount can't be greater than 500`);
    }

    if (elem.type === 'merchant-payment') {
      if (!elem.merchantCode) {
        throw new UserFacingError('INVALID_REQUEST - Missing property merchantCode');
      }

      if (elem.merchantCode.trim() === '') {
        throw new UserFacingError("INVALID_REQUEST - Property merchantCode can't be empty");
      }
    }
  }

  private findOperationByOTP(otp: number) {
    return this.operations.find((el: CreateOperation) => el.customerInfo.otp === otp);
  }

  private findNotificationByOTP(otp: number) {
    return this.notifications.find((el: OperationNotification) => el.otp === otp);
  }
}

const operationsService = new OperationsService();
export { operationsService as OperationsService };
