import { Request, Router } from "express";

import Server from "../classes/server";
import { RouteHandler, Get, Put } from "../decorators/router-handler";
import { tokenService } from "../services/token.service";

@RouteHandler("/tokens")
class TokensRoute {
  public router: Router;

  constructor(public app: Server) {}

  @Get("/:phoneNumber")
  public encode(request: Request<{phoneNumber: string}>) {
    return tokenService.getToken(request.params.phoneNumber)
  }

  @Get("/decode/:token")
  public decode(request: Request<{token: string}>) {
    return tokenService.decode(request.params.token)
  }

  @Get("/invalidate/:phoneNumber")
  public invalidate(request: Request<{phoneNumber: string}>) {
    return tokenService.invalidate(request.params.phoneNumber)
  }

  @Get("/renew/:phoneNumber")
  public renew(request: Request<{phoneNumber: string}>) {
    return tokenService.renew(request.params.phoneNumber)
  }
}

export default TokensRoute;
