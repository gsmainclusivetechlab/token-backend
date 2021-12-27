import { Request, Response, Router, NextFunction } from "express";
// import passport from 'passport';

function RouteHandler(URL: string): any {
  return function handleROUTE<T extends { new (...args: any[]): any }>(
    target: T
  ): T {
    return class HandleRoute extends target {
      constructor(...args: any[]) {
        super(...args);
        const self = this;
        target.prototype.router = Router();
        target.prototype._routes.forEach((route: any) => {
          if (route.strategyHandler) {
            target.prototype.router
              .route(route.url)
              [route.method](
                route.strategyHandler.bind(self),
                route.handler.bind(self)
              );
          } else {
            target.prototype.router
              .route(route.url)
              [route.method](route.handler.bind(self));
          }
        });
        args[0].addRoute(URL, target.prototype.router);
      }
    };
  };
}

function createMethodHandler(method: string) {
  return (param?: string): any => {
    param = param || "/";
    return (target: any, propertyKey: string): TypedPropertyDescriptor<any> => {
      const descriptor: any = Object.getOwnPropertyDescriptor(
        target,
        propertyKey
      );
      const originalMethod = descriptor.value;
      target._routes = target._routes || [];
      const asyncWrapper = createAsyncWrapper(originalMethod.bind(target));
      target._routes.push({ url: param, method, handler: asyncWrapper });
      return descriptor;
    };
  };
}

function createAsyncWrapper(
  handler: (request: Request, response: Response, next: NextFunction) => unknown
) {
  return function asyncWrapper(
    request: Request,
    response: Response,
    next: NextFunction
  ) {
    const prom: any = handler(request, response, next);
    if (prom && prom.then) {
      prom
        .then((result: any) => response.status(200).send(result))
        .catch((err: Error) => next(err));
    }
  };
}

const Get = createMethodHandler("get");
const Post = createMethodHandler("post");
const Put = createMethodHandler("put");
const Patch = createMethodHandler("patch");
const Delete = createMethodHandler("delete");

export { RouteHandler, Get, Post, Put, Delete, Patch };
