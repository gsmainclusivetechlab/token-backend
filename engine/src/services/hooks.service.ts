import axios from 'axios';
import { Request } from 'express';
import { UserFacingError } from '../classes/errors';
import { MMOWebhookBody, SMSWebhookBody, USSDWebhookBody } from '../interfaces/hook';
import { OperationType } from '../interfaces/operation';
import { GetOperationFromType } from '../lib/operations';
import { headersValidation } from '../utils/request-validation';
import { SMSService } from './sms.service';
import { USSDService } from './ussd.service';

class HooksService {
  async processSMSGateway(request: Request) {
    const { body } = request;
    this.validateBodyPropertiesGateway(body);

    if (body.system === 'mock') {
      headersValidation(request);
    }

    return SMSService.processSMSMessage(body);
  }

  async processUSSDGateway(request: Request) {
    const { body } = request;

    this.validateBodyPropertiesGateway(body);

    if (body.system === 'mock') {
      headersValidation(request);
    }

    return USSDService.processUSSDMessage(body);
  }

  async processMMO(body: MMOWebhookBody) {
    const { type, system, phoneNumber, amount, identifierType, otp } = body;

    const operationType: OperationType = GetOperationFromType(type);

    if (!operationType) {
      throw new UserFacingError('INVALID_REQUEST - Invalid Operation');
    }

    this.validateBodyPropertiesMMO(body);

    let identifier = null;

    if (identifierType === 'token') {
      const tokenApiResponse = await axios.get(`${process.env.TOKEN_API_URL}/tokens/${phoneNumber}`);
      identifier = tokenApiResponse.data.token;
    } else {
      identifier = phoneNumber;
    }

    const message = `The ${operationType} operation with the value of ${amount} for the customer with the identifier ${identifier} was successful`;
    this.sendAgentMerchantNotification(message, otp);
    SMSService.sendCustomerNotification(phoneNumber, message, system, otp);

    return { message: 'Thanks for using Engine API' };
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

    if (!body.system) {
      throw new UserFacingError('INVALID_REQUEST - Missing property system');
    }

    if (!(body.system === 'mock' || body.system === 'live')) {
      throw new UserFacingError('INVALID_REQUEST - Property system with wrong value');
    }
  }

  private validateBodyPropertiesMMO(body: MMOWebhookBody) {
    const { system, phoneNumber, amount, identifierType } = body;

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

    //TODO OTP
  }

  sendAgentMerchantNotification(message: string, otp: number) {
    axios.post(`${process.env.PROXY_API_URL}/operations/notify`, {
      message,
      otp
    });
  }
}

const hooksService = new HooksService();
export { hooksService as HooksService };
