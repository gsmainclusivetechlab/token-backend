import { Request, Router } from "express";

import Server from "../classes/server";
import { RouteHandler, Get, Put } from "../decorators/router-handler";
import { AccountNameQueryParams } from "../interfaces/account-name";
import { TransactionType } from "../interfaces/transaction";
import { mmoService } from "../services/mmo.service";

@RouteHandler("/transactions")
class TransactionsRoute {
  public router: Router;

  constructor(public app: Server) {}

  @Get("/type/:type")
  public getAccountName(request: Request<{type: TransactionType}, {}, {}, AccountNameQueryParams>) {
    return mmoService.startTransaction(request.params.type)
  }
}

export default TransactionsRoute;
