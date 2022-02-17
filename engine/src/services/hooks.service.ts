import axios, { AxiosError } from 'axios';
import { Request } from 'express';
import { UserFacingError } from '../classes/errors';
import { MMOWebhookBody, SMSWebhookBody, USSDWebhookBody } from '../interfaces/hook';
import { AccountNameReturn } from '../interfaces/mmo';
import { Operation, OperationType } from '../interfaces/operation';
import { GetOperationFromType } from '../lib/operations';
import { catchError } from '../utils/catch-error';
import { headersValidation } from '../utils/request-validation';
import { AccountsService } from './accounts.service';
import { SMSService } from './sms.service';
import { USSDService } from './ussd.service';

class HooksService {
  async processSMSGateway(request: Request) {
    const { body, headers } = request;
    this.validateBodyPropertiesGateway(body);

    if (body.system === 'mock') {
      headersValidation(headers);
    }

    return SMSService.processSMSMessage(body);
  }

  async processUSSDGateway(request: Request) {
    const { body, headers } = request;

    this.validateBodyPropertiesGateway(body);

    if (body.system === 'mock') {
      headersValidation(headers);
    }

    return USSDService.processUSSDMessage(body);
  }

  async processMMO(body: MMOWebhookBody) {
    try {
      this.validateBodyPropertiesMMO(body);

      const { type, system, phoneNumber, amount, identifierType, otp, createdBy, createdUsing, merchantCode } = body;

      const operationType: OperationType = GetOperationFromType(type);

      if (!operationType) {
        throw new UserFacingError('INVALID_REQUEST - Invalid Operation');
      }

      let identifier = null;

      if (identifierType === 'token') {
        const tokenApiResponse = await axios.get(`${process.env.TOKEN_API_URL}/tokens/${phoneNumber}`);
        identifier = tokenApiResponse.data.token;
      } else {
        identifier = phoneNumber;
      }

      switch (createdBy) {
        case 'customer':
          const getAccountNameData: AccountNameReturn = await AccountsService.getAccountInfo(identifier);

          const operationObj: Operation = {
            type: operationType,
            amount,
            system,
            identifier,
            identifierType,
            customerInfo: getAccountNameData,
            createdBy,
            createdUsing,
            merchantCode
          };

          axios.post(
            `${process.env.PROXY_API_URL}/operations/register`,
            {
              ...operationObj,
            },
            { headers: { sessionId: String(otp) } }
          );

          break;
        case 'agent':
        case 'merchant':
          const message = `The ${operationType} operation with the value of ${amount} for the customer with the identifier ${identifier} was successful`;
          this.sendAgentMerchantNotification(message, otp);
          SMSService.sendCustomerNotification(phoneNumber, message, system, otp);
          break;
        default:
          break;
      }

      return { message: 'Thanks for using Engine API' };
    } catch (err: any | AxiosError) {
      catchError(err);
    }
  }

  private validateBodyPropertiesGateway(body: SMSWebhookBody | USSDWebhookBody) {
    if (!body.phoneNumber) {
      throw new UserFacingError('INVALID_REQUEST - Missing property phoneNumber');
    }

    if (body.phoneNumber.trim() === '') {
      throw new UserFacingError("INVALID_REQUEST - Property phoneNumber can't be empty");
    }

    if (!body.text) {
      throw new UserFacingError('INVALID_REQUEST - Missing property text');
    }

    if (body.text.trim() === '') {
      throw new UserFacingError("INVALID_REQUEST - Property text can't be empty");
    }

    if (!body.system) {
      throw new UserFacingError('INVALID_REQUEST - Missing property system');
    }

    if (!(body.system === 'mock' || body.system === 'live')) {
      throw new UserFacingError('INVALID_REQUEST - Property system with wrong value');
    }
  }

  private validateBodyPropertiesMMO(body: MMOWebhookBody) {
    const { system, phoneNumber, amount, identifierType, otp, createdBy, createdUsing } = body;

    if (!(system === 'mock' || system === 'live')) {
      throw new UserFacingError('INVALID_REQUEST - Invalid System');
    }

    if (!(identifierType === 'token' || identifierType === 'phoneNumber')) {
      throw new UserFacingError('INVALID_REQUEST - Invalid identifier type');
    }

    if (!phoneNumber) {
      throw new UserFacingError('INVALID_REQUEST - Missing property phoneNumber');
    }

    if (phoneNumber.trim() === '') {
      throw new UserFacingError("INVALID_REQUEST - Property phoneNumber can't be empty");
    }

    if (!amount) {
      throw new UserFacingError('INVALID_REQUEST - Missing property amount');
    }

    if (!otp) {
      throw new UserFacingError('INVALID_REQUEST - Missing property otp');
    }

    if (!(createdBy === 'customer' || createdBy === 'agent' || createdBy === 'merchant')) {
      throw new UserFacingError('INVALID_REQUEST - Invalid created by value');
    }

    if (!(createdUsing === 'SMS' || createdUsing === 'USSD')) {
      throw new UserFacingError('INVALID_REQUEST - Invalid created using value');
    }
  }

  sendAgentMerchantNotification(message: string, otp: number) {
    axios.post(
      `${process.env.PROXY_API_URL}/operations/notify`,
      {
        message,
      },
      { headers: { sessionId: String(otp) } }
    );
  }
}

const hooksService = new HooksService();
export { hooksService as HooksService };
