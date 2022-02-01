import { Request, Router } from 'express';
import Server from '../classes/server';
import { RouteHandler, Post, Get, Delete } from '../decorators/router-handler';
import { AccountsService } from '../services/accounts.service';
import { headersValidation } from '../utils/request-validation';

@RouteHandler('/accounts')
class AccountsRoute {
  // Services Injection
  public router: Router;

  constructor(public app: Server) {}

  /**
   * @openapi
   * /accounts:
   *   post:
   *     tags:
   *        - "Accounts"
   *     summary: Create a customer account
   *     description: Makes a request to the MMO API to create the customer account
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
  public createAccount(request: Request<{}, {}, { nickName: string; phoneNumber: string }, {}>) {
    const { nickName, phoneNumber } = request.body;
    return AccountsService.createAccount(nickName, phoneNumber);
  }

  /**
   * @openapi
   * /accounts/:phoneNumber:
   *   delete:
   *     tags:
   *      - "Accounts"
   *     summary: Delete customer account 
   *     description: Makes a request to the MMO API to delete the customer account
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
  public deleteAccount(request: Request<{}, {}, {}, {}>) {
    return AccountsService.deleteAccount(request);
  }

  /**
   * @openapi
   * /accounts/:identifier:
   *   get:
   *     tags:
   *        - "Accounts"
   *     summary: Get user's account info
   *     description: Makes a request to the MMO API in order to get the user's account info
   *     parameters:
   *       - in: query
   *         name: identifier
   *         required: true
   *         description: Can be the customer's token or phone number.
   *         schema:
   *           type: string
   *           example: "233120046954"
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
  @Get('/:identifier')
  public getAccountInfo(request: Request<{ identifier: string }, {}, {}, {}>) {
    const { identifier } = request.params;
    return AccountsService.getAccountInfo(identifier);
  }

  /**
   * @openapi
   * /accounts/merchant/:code:
   *   get:
   *     tags:
   *        - "Accounts"
   *     summary: Get merchant info
   *     description: Makes a request to the MMO API in order to get the merchant info
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
   *                 type: object
   *                 properties:
   *                   code:
   *                     type: string
   *                     description: "Merchant Code"
   *                     example: "4321"
   *                   name:
   *                     type: string
   *                     description: "Merchant Name"
   *                     example: "XPTO Lda"
   *                   available:
   *                     type: boolean
   *                     description: "Flag that indicate if the merchant is available or not"
   *                     example: true
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
  @Get('/merchant/:code')
  public getMerchant(request: Request<{ code: string }, {}, {}, {}>) {
    return AccountsService.getMerchant(request);
  }

  @Post('/createMockAccount')
  public createMockAccount(request: Request<{}, {}, {}, {}>) {
    return AccountsService.createMockAccount();
  }

  @Get('/:otp/valid')
  public verifyOTP(request: Request<{ otp: string }, {}, {}, {}>) {
    return AccountsService.verifyOTP(request);
  }
}

export default AccountsRoute;
