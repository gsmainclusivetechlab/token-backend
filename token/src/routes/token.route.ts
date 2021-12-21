import { Request, Router } from "express";

import Server from "../classes/server";
import { RouteHandler, Get } from "../decorators/router-handler";
import { tokenService } from "../services/token.service";

@RouteHandler("/tokens")
class TokensRoute {
  public router: Router;

  constructor(public app: Server) {}

  @Get("/encode/:phoneNumber")
  public encode(request: Request<{phoneNumber: string}>) {
    return tokenService.encode(request.params.phoneNumber)
  }

  @Get("/decode/:token")
  public decode(request: Request<{token: string}>) {
    return tokenService.decode(request.params.token)
  }
}

export default TokensRoute;
