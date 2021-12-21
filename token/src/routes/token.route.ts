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
  
  @Get("/decode")
  public decode(request: Request) {
    return tokenService.decode()
  }
}

export default TokensRoute;
