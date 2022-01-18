import axios, { AxiosError } from 'axios';
import { ConflictError, NotFoundError, UserFacingError } from '../classes/errors';
import { LogLevels, logService } from '../services/log.service';

export function catchError(err: Error | AxiosError) {
  if (axios.isAxiosError(err) && err.response) {
    logService.log(LogLevels.ERROR, err.response?.data?.error);

    switch (err.response.status) {
      case 404:
        throw new NotFoundError(err.response?.data?.error);
      case 409:
        throw new ConflictError(err.response?.data?.error);
      default:
        throw new UserFacingError(err.response?.data?.error);
    }
  } else {
    logService.log(LogLevels.ERROR);

    switch (err.name) {
      case 'NotFoundError':
        throw new NotFoundError(err.message);
      case 'Conflict':
        throw new ConflictError(err.message);
      default:
        throw new UserFacingError(err.message);
    }
  }
}