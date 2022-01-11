import axios, { AxiosError } from 'axios';
import { Request } from 'express';
import { UserFacingError } from '../classes/errors';
import { LogLevels, logService } from './log.service';
import { Twilio } from 'twilio';
import { TwilioHookBody } from '../../interface/twilio';

class TwilioService {
  twilio: Twilio;

  init() {
    this.twilio = new Twilio(
      <string>process.env.TWILIO_SID,
      <string>process.env.TWILIO_TOKEN
    );
  }

  async sendMessage(phoneNumber: string, message: string) {
    try {
      await this.twilio.messages.create({
        body: message,
        messagingServiceSid: process.env.TWILIO_MESSAGE_SID,
        to: phoneNumber,
      });
      return { message: 'Message sent.' };
    } catch (error) {
      logService.log(LogLevels.ERROR, JSON.stringify(error));
      throw new UserFacingError('Error sending message');
    }
  }

  parseMessage(obj: TwilioHookBody) {
    return {
      phoneNumber: obj.From,
      text: obj.Body,
      system: 'live',
    };
  }
}

const twilioService = new TwilioService();
export { twilioService as TwilioService };
