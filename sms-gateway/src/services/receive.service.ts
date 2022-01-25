import axios, { AxiosError } from 'axios';
import { Request } from 'express';
import { UserFacingError } from '../classes/errors';
import { catchError } from '../utils/catch-error';
import { TwilioService } from './twilio.service';

class ReceiveService {
  async processReceive(request: Request) {
    try {
      const { body } = request;

      this.requestValidation(body);

      switch (body.system) {
        case 'mock':
          axios.post(process.env.PROXY_API_URL + '/sms-gateway/receive', body);
          return;
        case 'live':
          TwilioService.sendMessage(body.phoneNumber, body.message);
          return;
        default:
          throw new UserFacingError('Invalid system');
      }
    } catch (err: any | AxiosError) {
      catchError(err);
    }
  }

  private requestValidation(body: any) {
    if (!body.system || !(body.system === 'mock' || body.system === 'live')) {
      throw new UserFacingError('INVALID_REQUEST - Invalid system value');
    }

    if (!body.message) {
      throw new UserFacingError('INVALID_REQUEST - Missing property message');
    }

    if (!(typeof body.message === 'string' || body.message instanceof String)) {
      throw new UserFacingError('INVALID_REQUEST - Property message needs to be a string');
    }

    if (body.message.trim() === '') {
      throw new UserFacingError("INVALID_REQUEST - Property message can't be empty");
    }

    if (body.system === 'live') {
      if (!body.phoneNumber) {
        throw new UserFacingError('INVALID_REQUEST - Missing property phoneNumber');
      }

      if (!(typeof body.phoneNumber === 'string' || body.phoneNumber instanceof String)) {
        throw new UserFacingError('INVALID_REQUEST - Property phoneNumber needs to be a string');
      }

      if (body.phoneNumber.trim() === '') {
        throw new UserFacingError("INVALID_REQUEST - Property phoneNumber can't be empty");
      }
    }
  }
}

const receiveService = new ReceiveService();
export { receiveService as ReceiveService };
