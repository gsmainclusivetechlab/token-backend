import { Request, Router } from "express";

import Server from "../classes/server";
import { RouteHandler, Get, Put } from "../decorators/router-handler";
import { AccountNameQueryParams } from "../interfaces/account-name";
import { mmoService } from "../services/mmo.service";

@RouteHandler("/accounts")
class AccountsRoute {
  public router: Router;

  constructor(public app: Server) {}

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
  @Get("/msisdn/:phoneNumber/accountname")
  public getAccountName(request: Request<{phoneNumber: string}, {}, {}, AccountNameQueryParams>) {
    return mmoService.getAccountName(request.params.phoneNumber)
  }

  /**
   * @openapi
   * /accounts/authorize:
   *   get:
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
  @Get("authorize")
  public authorizeUser(request: Request<{}, {}, {}, {pin: string}>) {
    return mmoService.authorizeUser(request.query.pin)
  }
}

export default AccountsRoute;
