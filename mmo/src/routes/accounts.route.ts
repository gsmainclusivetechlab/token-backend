import { Request, Router } from 'express';

import Server from '../classes/server';
import { RouteHandler, Get, Put, Post, Delete } from '../decorators/router-handler';
import { AccountNameQueryParams } from '../interfaces/account-name';
import { mmoService } from '../services/mmo.service';

@RouteHandler('/accounts')
class AccountsRoute {
  public router: Router;

  constructor(public app: Server) {}

  @Post('/')
  public createUserAccount(request: Request<{}, {}, { fullName: string; phoneNumber: string }, {}>) {
    const { fullName, phoneNumber } = request.body;
    return mmoService.createUserAccount(fullName, phoneNumber);
  }

  @Delete('/:phoneNumber')
  public deleteUserAccount(request: Request<{phoneNumber: string}, {}, {}, {}>) {
    const { phoneNumber } = request.params;
    return mmoService.deleteUserAccount(phoneNumber);
  }

  /**
   * @openapi
   * /accounts/msisdn/{phoneNumber}/accountname:
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
   *       200:
   *         description: Created
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 name:
   *                   type: object
   *                   properties:
   *                      title:
   *                        type: string
   *                        description: Customer's title.
   *                        example: Dr
   *                      firstName:
   *                        type: string
   *                        description: Customer's firstName.
   *                        example: Leanne
   *                      middleName:
   *                        type: string
   *                        description: Customer's middleName.
   *                        example: Peter
   *                      lastName:
   *                        type: string
   *                        description: Customer's lastName.
   *                        example: Graham
   *                      fullName:
   *                        type: string
   *                        description: Customer's fullName.
   *                        example: Leanne Peter Graham
   *                 lei:
   *                   type: string
   *                   description: Customer's account number
   */
  @Get('/:identifier/accountname')
  public getAccountName(request: Request<{ identifier: string }, {}, {}, AccountNameQueryParams>) {
    const { identifier } = request.params;
    return mmoService.getAccountName(identifier);
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
   *       200:
   *         description: Created
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 message:
   *                   type: string
   *                   description: Message from MMO API
   *                   example: User authorized
   */
  @Post('/authorize')
  public authorizeUser(request: Request<{}, {}, { pin: string; phoneNumber: string }>) {
    return mmoService.authorizeUser(request.body.pin, request.body.phoneNumber);
  }
}

export default AccountsRoute;
