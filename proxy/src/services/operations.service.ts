import axios, { AxiosError } from 'axios';
import { NotFoundError, UserFacingError } from '../classes/errors';
import SafeAwait from '../lib/safe-await';
import { v4 as uuidv4 } from 'uuid';
import { Action, CreateOperationBody, CreateOperation, OperationNotification } from '../interfaces/operations';
import { catchError } from '../utils/catch-error';
import { AccountsService } from './accounts.service';
import { Request } from 'express';
import { headersValidation } from '../utils/request-validation';

class OperationsService {
  operations: CreateOperation[] = [];
  notifications: OperationNotification[] = [];

  async createOperation(request: Request) {
    const { body, headers } = request;

    headersValidation(headers);
    let elem: CreateOperationBody = body;
    this.validateCreateOperationBody(elem);
    const otp = request.headers['sessionid'] as string;

    const [accountInfoError, accountInfoData] = await SafeAwait(axios.get(`${process.env.ENGINE_API_URL}/accounts/${elem.identifier}`));
    if (accountInfoError) {
      catchError(accountInfoError);
    }

    elem.identifierType = elem.identifier === accountInfoData.data.phoneNumber ? 'phoneNumber' : 'token';
    if (elem.identifierType === 'token' && !accountInfoData.data.active) {
      throw new NotFoundError(`Doesn't exist any user with this phone number or token.`);
    }

    if (parseInt(otp) !== accountInfoData.data.otp) {
      throw new NotFoundError(`You only can create new operations for you.`);
    }

    if (elem.type === 'merchant-payment') {
      const [merchantInfoError, merchantInfoData] = await SafeAwait(
        axios.get(`${process.env.ENGINE_API_URL}/accounts/merchant/${elem.merchantCode}`, { headers: { sessionId: otp } })
      );
      if (merchantInfoError) {
        catchError(merchantInfoError);
      }
    }

    elem.customerInfo = { ...accountInfoData.data };

    this.setOperation(elem);

    return elem;
  }

  async manageOperation(request: Request) {
    try {
      const { headers, params } = request;
      headersValidation(headers);
      const { action, id } = params;
      const otp = parseInt(request.headers['sessionid'] as string);

      if (!(action === 'accept' || action === 'reject')) {
        throw new UserFacingError('Invalid action');
      }

      const operation = this.findOperationByIdAndOTP(id, otp);

      if (!operation) {
        throw new NotFoundError(`Doesn't exist the operation with id ${id} for this session.`);
      }

      const response = await axios.post(`${process.env.ENGINE_API_URL}/operations/${action}`, { ...operation });

      this.operations.splice(
        this.operations.findIndex((el: CreateOperation) => el.id === id),
        1
      );

      return response.data;
    } catch (err: any | AxiosError) {
      catchError(err);
    }
  }

  async getOperationsAndNotifications(request: Request) {
    const { headers } = request;
    headersValidation(headers);
    const otp = parseInt(request.headers['sessionid'] as string);
    AccountsService.updateSessionLastCall(otp);

    return {
      operations: this.filterOperationByOTP(otp),
      notifications: this.filterNotificationByOTP(otp),
    };
  }

  async createNotification(request: Request) {
    const { body, headers } = request;
    headersValidation(headers);

    const elem: OperationNotification = body;

    if (!elem.message) {
      throw new UserFacingError('INVALID_REQUEST - Missing property message');
    }

    const otp = parseInt(request.headers['sessionid'] as string);

    elem.id = uuidv4();
    elem.otp = otp;
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

  async deleteNotification(request: Request) {
    const { headers, params } = request;
    headersValidation(headers);
    const { id } = params;
    const otp = parseInt(request.headers['sessionid'] as string);

    const index = this.findIndexNotificationByIdAndOTP(id, otp);
    if (index === -1) {
      throw new NotFoundError(`Doesn't exist the notification with id ${id} for this session.`);
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

  private findIndexNotificationByIdAndOTP(id: string, otp: number) {
    return this.notifications.findIndex((el: OperationNotification) => el.id === id && el.otp === otp);
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

  private filterOperationByOTP(otp: number) {
    return this.operations.filter((el: CreateOperation) => el.customerInfo.otp === otp);
  }

  private filterNotificationByOTP(otp: number) {
    return this.notifications.filter((el: OperationNotification) => el.otp === otp);
  }
}

const operationsService = new OperationsService();
export { operationsService as OperationsService };
