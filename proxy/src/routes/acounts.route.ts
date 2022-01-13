import { Request, Router } from "express";
import Server from "../classes/server";
import { RouteHandler, Post, Get, Delete } from "../decorators/router-handler";
import { Action, CreateOperationBody, OperationNotification } from "../interfaces/operations";
import { OperationsService } from "../services/operations.service";

@RouteHandler("/accounts")
class OperationsRoute {
  // Services Injection
  public router: Router;

  constructor(public app: Server) {}

  @Post("/")
  public createAccount(request: Request<{}, {}, {}, {}>) {
    return OperationsService.getOperationsAndNotificationsToAgent();
  }

  @Delete("/")
  public deleteAccount(request: Request<{}, {}, {}, {}>) {
    return OperationsService.getOperationsAndNotificationsToMerchant();
  }
}

export default OperationsRoute;
