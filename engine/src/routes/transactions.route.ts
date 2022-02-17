import { Request, Router } from 'express';
import Server from '../classes/server';
import { RouteHandler, Get, Delete } from '../decorators/router-handler';
import { TransactionStatus } from '../interfaces/mmo';
import { TransactionsService } from '../services/transactions.service';
import { headersValidation } from '../utils/request-validation';


@RouteHandler('/transactions')
class TransactionsRoute {
  public router: Router;

  constructor(public app: Server) {}

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
   *                      createdBy: "agent",
   *                      createdUsing: "SMS",
   *                      merchant: {
   *                        code: "4321",
   *                        name: "XPTO Lda",
   *                        available: true
   *                      }
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
   *          $ref: "#/components/schemas/Merchant"
   *        identifierType:
   *          type: string
   *          description: "Identify what is the customer identifier. Value can be 'token' or 'phoneNumber'"
   *        otp:
   *          type: number
   *          description: "Customer one time password"
   *        createdBy:
   *          type: string
   *          description: "Who create the operation. Value can be 'customer', 'agent' or 'merchant'"
   *        createdUsing:
   *          type: string
   *          description: "Which mode was used to create the operation. Value can be 'SMS' or 'USSD'"
   * 
   *    Merchant:
   *      type: object
   *      properties:
   *        code:
   *          type: string
   *          description: "Merchant code"
   *        name:
   *          type: string
   *          description: "Merchant name"
   *        available:
   *          type: string
   *          description: "Flag that indicate if the merchant is available or not"
   */
  @Get('/:phoneNumber/:status')
  public getTransaction(request: Request<{ phoneNumber: string, status: TransactionStatus }, {}, {}, {}>){
    const { phoneNumber, status } = request.params;
    headersValidation(request.headers);
    const otp = request.headers['sessionid'] as string;

    return TransactionsService.getTransaction(phoneNumber, status, otp);
  }

  /**
   * @openapi
   * /transactions/{phoneNumber}/pending:
   *   delete:
   *     tags:
   *      - "Operations"
   *     summary: Get the pending transaction and delete it
   *     description: Check if exist a pending transaction on MMO and send a request to delete it on MMO
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
   *     responses:
   *      '200':
   *        description: OK
   *        content:
   *         application/json:
   *           schema:
   *             type: object
   *             properties:
   *               message:
   *                 type: string
   *                 example: "The transaction with id 408a6a77-2dc4-463e-8cca-02055c83a293 was deleted"
   *
   *      '404':
   *        description: Notification not found
   *        content:
   *         application/json:
   *           schema:
   *             type: object
   *             properties:
   *               message:
   *                 type: string
   *                 example: "The transaction with id 408a6a77-2dc4-463e-8cca-02055c83a293 doesn't exist."
   */
  @Delete('/:phoneNumber/pending')
  public getAndDeletePendingTransaction(request: Request<{ phoneNumber: string }, {}, {}, {}>){
    return TransactionsService.getAndDeletePendingTransaction(request);
  }
}

export default TransactionsRoute;
