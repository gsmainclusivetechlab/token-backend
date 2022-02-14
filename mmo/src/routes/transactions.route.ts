import { Request, Router } from 'express';
import { UserFacingError } from '../classes/errors';

import Server from '../classes/server';
import { RouteHandler, Post, Get } from '../decorators/router-handler';
import {
  TransactionsBody,
  TransactionStatus,
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
   *                identifierType: "phoneNumber",
   *                otp: 1234
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
   *          description: "Identify what is the customer identifier. Value can be 'token' or 'phoneNumber'"
   *        otp:
   *          type: number
   *          description: "Customer one time password"
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

  /**
   * @openapi
   * /transactions/{phoneNumber}/{status}:
   *   get:
   *     tags:
   *        - "Transactions"
   *     summary: Get an transaction based on customer's phone number and sessionId
   *     description: Get an transaction based on customer's phone number and sessionId
   *     parameters:
   *       - in: header
   *         name: sessionId
   *         description: Customer session id (OTP)
   *         required: false
   *         schema:
   *           type: number
   *           example: 1234
   *       - in: path
   *         name: phoneNumber
   *         required: true
   *         description: Customer's phone number.
   *         schema:
   *           type: string
   *           example: "+233207212676"
   *       - in: path
   *         name: status
   *         required: true
   *         description: Transaction status, Value can be 'pending' or 'accepted'.
   *         schema:
   *           type: string
   *           example: "pending"
   *     responses:
   *        '200':
   *           description: OK
   *           content:
   *             application/json:
   *               schema:
   *                 $ref: "#/components/schemas/Transaction"
   *               example:
   *                  {
   *                      callbackUrl: "http://localhost:4400/hooks/mmo",
   *                      type: "deposit",
   *                      phoneNumber: "+441234561815",
   *                      id: "80e8b4ed-47b5-4273-a16b-f718d739acdc",
   *                      system: "mock",
   *                      status: "pending",
   *                      amount: 123,
   *                      identifierType: "phoneNumber",
   *                      otp: 2005
   *                  }
   *
   *        '404':
   *           description: There are no transactions in pending state for this customer.
   *           content:
   *            application/json:
   *              schema:
   *                type: object
   *                properties:
   *                  error:
   *                    type: string
   *                    example: "There are no transactions in pending state for this customer."
   *
   * components:
   *  schemas:
   *    Transaction:
   *      type: object
   *      properties:
   *        id:
   *          type: string
   *          description: "Transaction id"
   *        phoneNumber:
   *          type: string
   *          description: "Customer phone number"
   *        type:
   *          type: string
   *          description: "Transaction type"
   *        callbackUrl:
   *          type: string
   *          description: "Callback url"
   *        status:
   *          type: string
   *          description: "Transaction status. Value can be 'pending' or 'accepted'"
   *        system:
   *          type: string
   *          description: "System that is used. Value can be 'live' or 'mock'"
   *        amount:
   *          type: number
   *          description: "Value associated with the operation"
   *        merchant:
   *          type: string
   *          description: "Merchant code"
   *        identifierType:
   *          type: string
   *          description: "Identify what is the customer identifier. Value can be 'token' or 'phoneNumber'"
   *        otp:
   *          type: number
   *          description: "Customer one time password"
   */
  @Get('/:phoneNumber/:status')
  public getTransaction(request: Request<{ phoneNumber: string, status: TransactionStatus }, {}, {}, {}>){
    return MmoService.getTransaction(request);
  }
}

export default TransactionsRoute;
