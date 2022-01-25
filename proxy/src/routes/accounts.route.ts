import { Request, Router } from "express";
import Server from "../classes/server";
import { RouteHandler, Post, Delete } from "../decorators/router-handler";
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
   *     description: Makes a request to the Engine API to delete the customer account
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
  @Delete("/:phoneNumber")
  public deleteUserAccount(request: Request<{phoneNumber: string}, {}, {}, {}>) {
    const { phoneNumber } = request.params;
    return AccountsService.deleteAccount(phoneNumber);
  }
}

export default AccountsRoute;
