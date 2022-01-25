import { Request, Router } from "express";

import Server from "../classes/server";
import { RouteHandler, Get } from "../decorators/router-handler";
import { tokenService } from "../services/token.service";

@RouteHandler("/tokens")
class TokensRoute {
  public router: Router;

  constructor(public app: Server) {}

  /**
   * @openapi
   * /tokens/{phoneNumber}:
   *   get:
   *     tags:
   *        - "Tokens"
   *     summary: Generate token
   *     description: Generates a new token or return the already existing one, if valid
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
   *         description: Token
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 token:
   *                   type: string
   *                   description: Customer's token
   *                   example: 233120046954
  */
  @Get("/:phoneNumber")
  public encode(request: Request<{phoneNumber: string}>) {
    return tokenService.getToken(request.params.phoneNumber)
  }

  /**
   * @openapi
   * /tokens/decode/{token}:
   *   get:
   *     tags:
   *        - "Tokens"
   *     summary: Decode token
   *     description: Converts token into customer's info
   *     parameters:
   *       - in: path
   *         name: token
   *         required: true
   *         description: Customer's token.
   *         schema:
   *           type: string
   *           example: "233120046954"
   *     responses:
   *       200:
   *         description: Token
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 phoneNumber:
   *                   type: string
   *                   description: Customer's phoneNumber
   *                   example: "+233207212676"
   *                 indicative:
   *                   type: string
   *                   description: Customer's indicative
   *                   example: "+233"
   *                 token:
   *                   type: string
   *                   description: Customer's token
   *                   example: 233120046954
   *                 active:
   *                   type: boolean
   *                   description: Is customer's token active
   *                   example: true
  */
  @Get("/decode/:token")
  public decode(request: Request<{token: string}>) {
    return tokenService.decode(request.params.token)
  }

  /**
   * @openapi
   * /tokens/invalidate/{phoneNumber}:
   *   get:
   *     tags:
   *        - "Tokens"
   *     summary: Invalidate token
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
   *         description: Token
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                  phoneNumber:
   *                    type: string
   *                    description: Customer's phoneNumber
   *                    example: "+233207212676"
   *                  indicative:
   *                    type: string
   *                    description: Customer's indicative
   *                    example: "+233"
   *                  token:
   *                    type: string
   *                    description: Customer's token
   *                    example: 233120046954
   *                  active:
   *                    type: boolean
   *                    description: Is customer's token active
   *                    example: true
  */
  @Get("/invalidate/:phoneNumber")
  public invalidate(request: Request<{phoneNumber: string}>) {
    return tokenService.invalidate(request.params.phoneNumber)
  }

  /**
   * @openapi
   * /tokens/renew/{phoneNumber}:
   *   get:
   *     tags:
   *        - "Tokens"
   *     summary: Renew token
   *     description: Invalidates the current token and creates a new one
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
   *         description: Token
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 token:
   *                   type: string
   *                   description: Customer's token
   *                   example: 233120046954
  */
  @Get("/renew/:phoneNumber")
  public renew(request: Request<{phoneNumber: string}>) {
    return tokenService.renew(request.params.phoneNumber)
  }
}

export default TokensRoute;
