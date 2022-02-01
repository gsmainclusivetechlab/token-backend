import { Request } from 'express';
import { UserFacingError } from '../classes/errors';

export function headersValidation(request: Request) {
  const sessionId = request.headers['sessionid'] as string;
  if (!sessionId) {
    throw new UserFacingError('Header sessionId is mandatory!');
  }
  const parsedSessionId = parseInt(sessionId);

  if (isNaN(parsedSessionId) || parsedSessionId % 1 != 0) {
    throw new UserFacingError('Header sessionId needs to be a number without decimals!');
  }
}
