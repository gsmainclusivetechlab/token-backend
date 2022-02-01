import { Request, Router } from 'express';
import { UserFacingError } from '../classes/errors';

import Server from '../classes/server';
import { RouteHandler, Post } from '../decorators/router-handler';
import {
  TransactionsBody,
  TransactionType,
} from '../interfaces/transaction';
import { MmoService } from '../services/mmo.service';

@RouteHandler('/transactions')
class TransactionsRoute {
  public router: Router;

  constructor(public app: Server) {}

  /**
   * @openapi
   * /transactions/type/:type:
   *   post:
   *     tags:
   *        - "Transactions"
   *     summary: Handles customer's transactions
   *     parameters:
   *       - in: header
   *         name: X-Callback-URL
   *         description: Callback url
   *         required: true
   *         schema:
   *           type: string
   *           example: "http://localhost:4400/hooks/mmo"
   *       - in: path
   *         name: type
   *         required: true
   *         description: transaction type.
   *         schema:
   *           type: string
   *           example: "deposit"
   *     requestBody:
   *        required: true
   *        content:
   *          application/json:
   *            schema:
   *              $ref: "#/components/schemas/TransactionsBody"
   *            example: 
   *              {
   *                amount: 100,
   *                debitParty: [{key: "msisdn", value: "+233207212676"}],
   *                creditParty: [{key: "msisdn", value: "+233207212676"}],
   *                currency: "RWF",
   *                system: "mock",
   *                identifierType: "phoneNumber"
   *              }
   * 
   *     responses:
   *       200:
   *         description: Created
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 serverCorrelationId:
   *                   type: string
   *                   description: Transactions id
   *                   example: 10d9d96c-b477-4d98-9d54-5fa7bd6ca532
   *                 status:
   *                   type: string
   *                   description: Transactions status
   *                   example: pending
   *                 notificationMethod:
   *                   type: string
   *                   description: Transactions notification method
   *                   example: polling
   *                 objectReference:
   *                   type: string
   *                   description: Transactions object reference
   *                   example: 20256
   *                 pollLimit:
   *                   type: number
   *                   description: Transactions poll limit
   *                   example: 100
   * 
   *       '400':
   *          description: Invalid Request.
   *          content:
   *             application/json:
   *               schema:
   *                 type: object
   *                 properties:
   *                   message:
   *                     type: string
   * 
   * 
   * components:
   *  schemas:
   *    TransactionsBody:
   *      type: object
   *      properties:
   *        amount:
   *          type: number
   *          description: "Value associated with the operation"
   *        debitParty:
   *          type: array
   *          description: "Account"
   *          items:
   *            type: object
   *            properties:
   *              key:
   *                type: string  
   *              value:
   *                type: string  
   *        creditParty:
   *          type: array
   *          description: "Account"
   *          items:
   *            type: object
   *            properties:
   *              key:
   *                type: string  
   *              value:
   *                type: string  
   *        currency:
   *          type: string
   *          description: "Currency of the operation"
   *        system:
   *          type: string
   *          description: "System that is used. Value can be 'live' or 'mock'"
   *        merchantCode:
   *          type: string
   *          description: "Merchant Code"
   *        identifierType:
   *          type: string
   *          description: "Identify what is the identifier. Value can be 'token' or 'phoneNumber'"
  */
  @Post('/type/:type')
  public startTransaction(
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
    return MmoService.startTransaction(
      request.params.type,
      callbackUrl,
      request.body
    );
  }
}

export default TransactionsRoute;
