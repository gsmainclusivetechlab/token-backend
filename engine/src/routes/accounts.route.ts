import { Request, Router } from 'express';
import Server from '../classes/server';
import { RouteHandler, Post, Get, Delete } from '../decorators/router-handler';
import { AccountsService } from '../services/accounts.service';

@RouteHandler('/accounts')
class AccountsRoute {
  // Services Injection
  public router: Router;

  constructor(public app: Server) {}

  @Post('/')
  public createAccount(request: Request<{}, {}, { fullName: string; phoneNumber: string }, {}>) {
    const { fullName, phoneNumber } = request.body;
    return AccountsService.createAccount(fullName, phoneNumber);
  }

  @Delete('/')
  public deleteAccount(request: Request<{}, {}, { phoneNumber: string }, {}>) {
    const { phoneNumber } = request.body;
    return AccountsService.deleteAccount(phoneNumber);
  }

  /**
   * @openapi
   * /operations/account-info:
   *   get:
   *     tags:
   *        - "Operations"
   *     summary: Get user's account info
   *     description: Makes a request to the MMO API in order to get the user's account info
   *     parameters:
   *       - in: query
   *         name: token
   *         required: true
   *         description: Customer's token.
   *         schema:
   *           type: string
   *           example: "233120046954"
   *       - in: query
   *         name: amount
   *         required: true
   *         description: Operation amount.
   *         schema:
   *           type: string
   *           example: "200"
   */
  @Get('/:identifier')
  public getAccountInfo(request: Request<{ identifier: string }, {}, {}, {}>) {
    const { identifier } = request.params;
    return AccountsService.getAccountInfo(identifier);
  }
}

export default AccountsRoute;
