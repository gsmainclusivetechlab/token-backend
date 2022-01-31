import axios, { AxiosError } from 'axios';
import { Request } from 'express';
import { UserFacingError } from '../classes/errors';
import { catchError } from '../utils/catch-error';

class SendService {
  async processSend(request: Request) {
    const { body, headers } = request;

    //Only for JEST
    if (body.text === 'PING') {
      return 'PONG';
    }

    this.requestValidation(body);

    return this.manageRequest(body, headers);
  }

  private requestValidation(body: any) {
    //Text
    if (!body.text) {
      throw new UserFacingError('INVALID_REQUEST - Missing property text');
    }

    if (!(typeof body.text === 'string' || body.text instanceof String)) {
      throw new UserFacingError('INVALID_REQUEST - Property text needs to be a string');
    }

    if (body.text.trim() === '') {
      throw new UserFacingError("INVALID_REQUEST - Property text can't be empty");
    }

    //System
    if (!body.system || !(body.system === 'mock' || body.system === 'live')) {
      throw new UserFacingError('INVALID_REQUEST - Invalid system value');
    }

    //PhoneNumber
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

  private manageRequest(body: any, headers: any) {
    const ussdIdentifier = '*165#*';
    const sessionId = headers['sessionid'] as string;

    if (body.text.startsWith(ussdIdentifier)) {
      body.text = body.text.slice(ussdIdentifier.length);
      return this.sendAxiosPost(`${process.env.ENGINE_API_URL}/hooks/ussd-gateway`, body, sessionId);
    } else {
      return this.sendAxiosPost(`${process.env.ENGINE_API_URL}/hooks/sms-gateway`, body, sessionId);
    }
  }

  private async sendAxiosPost(path: string, body: any, sessionId: string) {
    let headers = undefined;

    if (sessionId) {
      headers = { sessionId };
    }

    try {
      const response = await axios.post(path, body, { headers });
      return response.data;
    } catch (err: any | AxiosError) {
      catchError(err);
    }
  }
}

const sendService = new SendService();
export { sendService as SendService };
