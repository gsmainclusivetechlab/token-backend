import { Request, Router } from "express";

import Server from "../classes/server";
import { RouteHandler, Get, Put } from "../decorators/router-handler";
import { AccountNameParams } from "../interfaces/account-name";
import { mmoService } from "../services/mmo.service";

@RouteHandler("/accounts")
class MmoRoute {
  public router: Router;

  constructor(public app: Server) {}

  @Get("/msisdn/:phoneNumber/accountname")
  public getAccountName(request: Request<{phoneNumber: string}, {}, {}, AccountNameParams>) {
    return mmoService.getAccountName()
  }
}

export default MmoRoute;
