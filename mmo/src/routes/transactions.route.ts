import { Request, Router } from 'express';

import Server from '../classes/server';
import { RouteHandler, Get } from '../decorators/router-handler';
import {
  TransactionsBody,
  TransactionsQueryParams,
  TransactionType,
} from '../interfaces/transaction';
import { mmoService } from '../services/mmo.service';

@RouteHandler('/transactions')
class TransactionsRoute {
  public router: Router;

  constructor(public app: Server) {}

  @Get('/type/:type')
  public getAccountName(
    request: Request<
      { type: TransactionType },
      {},
      TransactionsBody,
      TransactionsQueryParams
    >
  ) {
    return mmoService.startTransaction(
      request.params.type,
      request.query['X-Callback-URL'],
      request.body
    );
  }
}

export default TransactionsRoute;
