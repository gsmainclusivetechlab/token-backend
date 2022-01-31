import { Request, Router } from 'express';
import Server from '../classes/server';
import { RouteHandler, Get, Post, Delete } from '../decorators/router-handler';
import { AccountNameQueryParams } from '../interfaces/account-name';
import { AccountsService } from '../services/accounts.service';
import { MmoService } from '../services/mmo.service';

@RouteHandler('/accounts')
class AccountsRoute {
  public router: Router;

  constructor(public app: Server) {}

  /**
   * @openapi
   * /accounts:
   *   post:
   *     tags:
   *        - "Accounts"
   *     summary: Create a customer account
   *     description: Create the customer account on database
   *     requestBody:
   *      required: true
   *      content:
   *        application/json:
   *          schema:
   *            type: object
   *            properties:
   *              nickName:
   *                type: string
   *                description: Customer nick name.
   *                example: "Test OpenApi"
   *              phoneNumber:
   *                type: string
   *                description: Customer phone number.
   *                example: "+441632960067"
   *
   *     responses:
   *        '200':
   *           description: OK
   *           content:
   *             application/json:
   *                schema:
   *                  type: object
   *                  properties:
   *                    nickName:
   *                      type: string
   *                      example: "Test OpenApi"
   *                    phoneNumber:
   *                      type: string
   *                      example: "+441632960067"
   *
   *        '409':
   *           description: This mobile phone is already registered to another user.
   *           content:
   *            application/json:
   *               schema:
   *                 type: object
   *                 properties:
   *                   error:
   *                     type: string
   *                     example: "This mobile phone is already registered to another user."
   *
   */
  @Post('/')
  public createUserAccount(request: Request<{}, {}, { nickName: string; phoneNumber: string }, {}>) {
    const { nickName, phoneNumber } = request.body;
    return AccountsService.createUserAccount(nickName, phoneNumber);
  }

  /**
   * @openapi
   * /accounts/:phoneNumber:
   *   delete:
   *     tags:
   *      - "Accounts"
   *     summary: Delete customer account
   *     description: Delete the customer account from database
   *     parameters:
   *      - in: path
   *        name: phoneNumber
   *        required: true
   *        description: Customer Phone Number.
   *        schema:
   *          type: string
   *          example: "+441632960067"
   *     responses:
   *        '200':
   *           description: OK
   *           content:
   *            application/json:
   *              schema:
   *                type: object
   *                properties:
   *                  message:
   *                    type: string
   *                    example: "User deleted"
   *
   *        '404':
   *           description: Doesn't exist any user with this phone number.
   *           content:
   *            application/json:
   *              schema:
   *                type: object
   *                properties:
   *                  error:
   *                    type: string
   *                    example: "Doesn't exist any user with this phone number."
   *
   *        '400':
   *           description: Invalid Request.
   *           content:
   *              application/json:
   *                schema:
   *                  type: object
   *                  properties:
   *                    message:
   *                      type: string
   */
  @Delete('/')
  public deleteUserAccount(request: Request<{}, {}, {}, {}>) {
    return AccountsService.deleteUserAccount(request);
  }

  /**
   * @openapi
   * /accounts/:identifier/accountname:
   *   get:
   *     tags:
   *        - "Accounts"
   *     summary: Get user's account info
   *     description: Gets user's account info
   *     parameters:
   *       - in: path
   *         name: phoneNumber
   *         required: true
   *         description: Customer's phone number.
   *         schema:
   *           type: string
   *           example: "+233207212676"
   *     responses:
   *        '200':
   *           description: OK
   *           content:
   *             application/json:
   *               schema:
   *                 $ref: "#/components/schemas/CustomerInformation"
   *               example:
   *                  {
   *                      nickName: "Teste",
   *                      phoneNumber: "+441632960067",
   *                      indicative: "+44",
   *                      active: true,
   *                  }
   *
   *        '404':
   *           description: Doesn't exist any user with this phone number.
   *           content:
   *            application/json:
   *              schema:
   *                type: object
   *                properties:
   *                  error:
   *                    type: string
   *                    example: "Doesn't exist any user with this phone number."
   *
   * components:
   *  schemas:
   *    CustomerInformation:
   *      type: object
   *      properties:
   *        nickName:
   *          type: string
   *          description: "Customer nick name"
   *        phoneNumber:
   *          type: string
   *          description: "Customer phone number"
   *        indicative:
   *          type: string
   *          description: "Contry code"
   *        active:
   *          type: boolean
   *          description: "Flag that indicate if the user have a token active or not"
   */
  @Get('/:identifier/accountname')
  public getAccountName(request: Request<{ identifier: string }, {}, {}, AccountNameQueryParams>) {
    const { identifier } = request.params;
    return AccountsService.getAccountName(identifier);
  }

  /**
   * @openapi
   * /accounts/authorize:
   *   post:
   *     tags:
   *        - "Accounts"
   *     summary: Authorize customer
   *     description: Check if PIN is equal to 1234
   *     parameters:
   *       - in: query
   *         name: pin
   *         required: true
   *         description: Customer's PIN.
   *         schema:
   *           type: string
   *           example: "1234"
   *     responses:
   *       '200':
   *         description: OK
   *         content:
   *           application/json:
   *              schema:
   *                $ref: "#/components/schemas/Transaction"
   *              example:
   *                {
   *                    type: "cash-in",
   *                    system: "mock",
   *                    phoneNumber: "+233207212676",
   *                    amount: 100,
   *                    identifierType: "phoneNumber"
   *                }
   *
   *       '401':
   *          description: Wrong PIN
   *          content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 error:
   *                   type: string
   *                   example: "Invalid PIN"
   *
   *       '404':
   *          description: Transaction not found
   *          content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 error:
   *                   type: string
   *                   example: "Doesn't exist any pending transaction for this phone number"
   *
   * components:
   *  schemas:
   *    Transaction:
   *      type: object
   *      properties:
   *        id:
   *          type: string
   *          description: "Transaction id"
   *        callbackUrl:
   *          type: string
   *          description: "Callback url"
   *        status:
   *          type: string
   *          description: "Transactions status"
   *        type:
   *          type: string
   *          description: "Type of operation. Value can be 'cash-in', 'cash-out' or 'merchant-payment'"
   *        system:
   *          type: string
   *          description: "System that is used. Value can be 'live' or 'mock'"
   *        phoneNumber:
   *          type: string
   *          description: "Customer phone number"
   *        amount:
   *          type: number
   *          description: "Value associated with the operation"
   *        identifierType:
   *          type: string
   *          description: "Identify what is the identifier. Value can be 'token' or 'phoneNumber'"
   *        merchant:
   *          $ref: "#/components/schemas/Merchant"
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
  @Post('/authorize')
  public authorizeUser(request: Request<{}, {}, { pin: string; phoneNumber: string; otp: number }>) {
    return MmoService.authorizeUser(request.body.pin, request.body.phoneNumber, request.body.otp);
  }

  /**
   * @openapi
   * /accounts/:code/merchant:
   *   get:
   *     tags:
   *        - "Accounts"
   *     summary: Gets merchant's info
   *     description: Gets merchant's info
   *     parameters:
   *       - in: query
   *         name: code
   *         required: true
   *         description: Merchant code.
   *         schema:
   *           type: string
   *           example: "4321"
   *     responses:
   *        '200':
   *           description: OK
   *           content:
   *             application/json:
   *               schema:
   *                 $ref: "#/components/schemas/Merchant"
   *               example:
   *                 {
   *                    code: "4321",
   *                    name: "XPTO Lda",
   *                    available: true
   *                 }
   *
   *        '404':
   *           description: Doesn't exist a merchant available with this code
   *           content:
   *            application/json:
   *              schema:
   *                type: object
   *                properties:
   *                  error:
   *                    type: string
   *                    example: "Doesn't exist a merchant available with this code"
   */
  @Get('/:code/merchant')
  public getMerchant(request: Request<{ code: string }, {}, {}, {}>) {
    const { code } = request.params;
    return AccountsService.getMerchant(code);
  }

  @Post('/createMockAccount')
  public createMockAccount(request: Request<{}, {}, {}, {}>) {
    return AccountsService.createMockAccount();
  }
}

export default AccountsRoute;
