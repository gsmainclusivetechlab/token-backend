import axios, { AxiosError } from 'axios';
import { Request } from 'express';
import { UserFacingError } from '../classes/errors';
import { LogLevels, logService } from './log.service';
import { Twilio } from 'twilio';

class TwilioService {
  twilio: Twilio;

  init() {
    this.twilio = new Twilio(
      <string>process.env.TWILIO_SID,
      <string>process.env.TWILIO_TOKEN
    );
  }

  async sendMessage(message: string, phoneNumber: string) {
    try {
      await this.twilio.messages.create({body: message, from: process.env.TWILIO_PHONE, to: phoneNumber})
      return {message: 'Message sent.'}
    } catch (error) {
      logService.log(LogLevels.ERROR, JSON.stringify(error))
      throw new UserFacingError('Error sending message')
    }
  }
}

const twilioService = new TwilioService();
export { twilioService as TwilioService };
