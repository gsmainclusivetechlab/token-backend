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

  /**
   * @openapi
   * /transactions/type/{type}:
   *   get:
   *     tags:
   *        - "Transactions"
   *     summary: Handles customer's transactions
   *     parameters:
   *       - in: path
   *         name: type
   *         required: true
   *         description: transaction type.
   *         schema:
   *           type: string
   *           example: "deposit"
   *     responses:
   *       200:
   *         description: Created
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 data:
   *                   type: object
   *                   properties:
   *                     serverCorrelationId:
   *                       type: string
   *                       description: Transactions id
   *                       example: 10d9d96c-b477-4d98-9d54-5fa7bd6ca532
   *                     status:
   *                       type: string
   *                       description: Transactions status
   *                       example: pending
   *                     notificationMethod:
   *                       type: string
   *                       description: Transactions notification method
   *                       example: polling
   *                     objectReference:
   *                       type: string
   *                       description: Transactions object reference
   *                       example: 20256
   *                     pollLimit:
   *                       type: number
   *                       description: Transactions poll limit
   *                       example: 100
  */
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
