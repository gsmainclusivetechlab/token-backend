import { Request, Router } from "express";
import Server from "../classes/server";
import { RouteHandler, Post, Get, Delete } from "../decorators/router-handler";
import { AccountsService } from "../services/accounts.service";
import { OperationsService } from "../services/operations.service";

@RouteHandler("/accounts")
class AccountsRoute {
  // Services Injection
  public router: Router;

  constructor(public app: Server) {}

  @Post("/")
  public createAccount(request: Request<{}, {}, {}, {}>) {
    return OperationsService.getOperationsAndNotificationsToAgent();
  }

  @Delete("/:phoneNumber")
  public deleteUserAccount(request: Request<{phoneNumber: string}, {}, {}, {}>) {
    const { phoneNumber } = request.params;
    return AccountsService.deleteAccount(phoneNumber);
  }
}

export default AccountsRoute;
