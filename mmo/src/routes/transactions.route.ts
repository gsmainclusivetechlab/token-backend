import { Request, Router } from 'express';
import { UserFacingError } from '../classes/errors';

import Server from '../classes/server';
import { RouteHandler, Post } from '../decorators/router-handler';
import {
  TransactionsBody,
  TransactionsHeaders,
  TransactionType,
} from '../interfaces/transaction';
import { mmoService } from '../services/mmo.service';

@RouteHandler('/transactions')
class TransactionsRoute {
  public router: Router;

  constructor(public app: Server) {}

  @Post('/type/:type')
  public getAccountName(
    request: Request<
      { type: TransactionType },
      {},
      TransactionsBody
    >
  ) {
    const callbackUrl = request.headers['x-callback-url'] as string
    if(!callbackUrl) {
      throw new UserFacingError('callbackUrl is mandatory')
    }
    return mmoService.startTransaction(
      request.params.type,
      callbackUrl,
      request.body
    );
  }
}

export default TransactionsRoute;
