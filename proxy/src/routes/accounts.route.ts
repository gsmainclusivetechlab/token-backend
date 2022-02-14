import { Request, Router } from "express";
import Server from "../classes/server";
import { RouteHandler, Post, Get } from "../decorators/router-handler";
import { AccountsService } from "../services/accounts.service";

@RouteHandler("/accounts")
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
   *     description: Makes a request to the Engine API to create the customer account
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
  @Post("/")
  public createAccount(request: Request<{}, {}, { nickName: string; phoneNumber: string }, {}>) {
    return AccountsService.createAccount(request);
  }

  /**
   * @openapi
   * /accounts/createMockAccount:
   *   post:
   *     tags:
   *        - "Accounts"
   *     summary: Create a mock account
   *     description: Makes a request to the Engine API to create a mock account
   *     responses:
   *        '200':
   *           description: OK
   *           content:
   *             application/json:
   *               schema:
   *                 $ref: "#/components/schemas/CustomerInformation"
   *               example:
   *                  {
   *                      nickName: "MockUser",
   *                      phoneNumber: "+351922774207",
   *                      indicative: "+351",
   *                      otp: 1801
   *                  }
   */
  @Post('/createMockAccount')
  public createMockAccount(request: Request<{}, {}, {}, {}>) {
    return AccountsService.createMockAccount();
  }

  /**
   * @openapi
   * /accounts/{otp}/valid:
   *   get:
   *     tags:
   *        - "Accounts"
   *     summary: Verify if the OTP is valid and return customer information
   *     description: Makes a request to the Engine API to verify if the OTP is valid
   *     parameters:
   *       - in: path
   *         name: otp
   *         required: true
   *         description: Customer One Time Password.
   *         schema:
   *           type: number
   *           example: 1234
   *     responses:
   *        '200':
   *           description: OK
   *           content:
   *             application/json:
   *               schema:
   *                 $ref: "#/components/schemas/CustomerInformation"
   *               example:
   *                  {
   *                      nickName: "MockUser",
   *                      phoneNumber: "+351922774207",
   *                      indicative: "+351",
   *                      otp: 1801
   *                  }
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
   * 
   *        '404':
   *           description: Doesn't exist any user with this otp.
   *           content:
   *            application/json:
   *              schema:
   *                type: object
   *                properties:
   *                  error:
   *                    type: string
   *                    example: "Doesn't exist any user with this otp."
   */
  @Get('/:otp/valid')
  public verifyOTP(request: Request<{ otp: string }, {}, {}, {}>) {
    return AccountsService.verifyOTP(request);
  }
}

export default AccountsRoute;
