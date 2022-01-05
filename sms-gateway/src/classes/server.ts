import { NextFunction, Request, Response } from "express";

import bodyParser from "body-parser";
import cors from "cors";
import express from "express";
import http from "http";
import https from "https";
import { UserFacingError } from "../classes/errors";
import { LogLevels, logService } from "../services/log.service";
import swaggerUi from 'swagger-ui-express';
import swaggerJSDoc from 'swagger-jsdoc';

const errorHandler = (err: any, req: any, res: any, next: any) => {
  logService.log(LogLevels.WARNING, `Catch all errors`);
  if (err instanceof UserFacingError) {
    res.status(400).send({ error: err.message || "Something went wrong" });
    return;
  }

  logService.log(LogLevels.ERROR, `Bubbled up error`, [err.message, err.stack]);
  if (err.name === "UnauthorizedError") {
    res.status(401).send({ error: err.message });
    return;
  }
  if (res.headersSent) {
    return next(err);
  }
  res.status(500);
  if (process.env.NODE_ENV === "development") {
    res.send({
      error: "Something went wrong",
      realErrorDevelopment: {
        message: err.message,
        stack: err.stack,
      },
    });
  } else {
    // Do not send stack traces or expose code to the client
    res.send({ error: "Something went wrong" });
  }
};

const notFoundHandler = (req: Request, res: Response, next: NextFunction) => {
  logService.log(LogLevels.WARNING, `Bubbled up 404 error`, req.originalUrl);
  res.status(404).send({ code: 404, msg: "Not Found" });
};

class Server {
  protected app: express.Application;
  protected httpServer: http.Server;
  protected httpsServer: https.Server;
  private routes: string[] = [];
  public port: number | string;

  constructor(port: number | string = 4400) {
    this.app = express();
    this.port = port;
    this.app.set("port", port);
    this.config();
    this.getServerInstance();
  }

  public getExpressInstance() {
    return this.app;
  }

  private config() {
    this.app.use(bodyParser.raw());
    this.app.use(
      bodyParser.json({
        verify: (req, res, buf) => {
          (req as any).rawBody = buf;
        },
      })
    );
    // this.app.use((req, res, next) => {
    //   req.headers.origin = req.headers.origin || req.headers.host;
    //   next();
    // });

    this.app.use(cors());

    // Options HTTP Method (catch all)
    this.app.options("/*", (req, res, next) => {
      res.header("Access-Control-Allow-Origin", "*");
      res.header("Access-Control-Allow-Methods", "GET,PUT,POST,DELETE,OPTIONS");
      res.header(
        "Access-Control-Allow-Headers",
        "Content-Type, Authorization, Content-Length, X-Requested-With"
      );
      res.send(200);
    });
  }

  // Routing Methods
  public addRoute(routeUrl: string, routerHandler: express.Router): void {
    if (this.routes.indexOf(routeUrl) === -1) {
      this.routes.push(routeUrl);
      this.app.use(routeUrl, routerHandler);
    }
  }

  public addDocsRoute() {
    const swaggerDefinition = {
      openapi: '3.0.0',
      info: {
        title: 'SMS-Gateway API',
        version: '1.1.0',
      },
      servers: [
        {
          url: 'http://localhost:4100',
          description: 'Development server',
        },
      ],
    };

    const options = {
      swaggerDefinition,
      apis: [`${__dirname}/../routes/*.ts`],
    };

    const swaggerSpec = swaggerJSDoc(options);
    this.routes.push('/docs');
    this.app.use('/docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));
  }

  // Exposed public routes (service discovery)
  public getRoutes(): string[] {
    return ["/health"];
  }

  public addErrorHandler() {
    this.app.use(errorHandler);
  }

  public add404Handler() {
    logService.log(LogLevels.WARNING, "404 Error Handler Attached");
    this.app.use(notFoundHandler);
  }

  public async start(): Promise<void> {
    const logLevel = process.env.LOG_LEVEL as LogLevels;
    this.getHttpServer().listen(this.app.get("port"), () => {
      logService.log(
        logLevel || LogLevels.DEBUG,
        `App is running at ${
          process.env.PROTOCOL || "http"
        }://localhost:${this.app.get("port")} in ${this.app.get("env")} mode`
      );
      logService.log(LogLevels.DEBUG, `Press CTRL-C to stop`);
    });
  }

  private getServerInstance() {
    if (process.env.PROTOCOL === "https") {
      //   const cert = readFileSync(join(__dirname, '../../certs/selfsigned.crt'));
      //   const key = readFileSync(join(__dirname, '../../certs/selfsigned.key'));
      //   const options = {
      //     key: key,
      //     cert: cert,
      //   };

      const options = {};

      this.httpsServer = https.createServer(options, this.app);
      return this.httpsServer;
    } else {
      this.httpServer = http.createServer(this.app);
      return this.httpServer;
    }
  }

  public getHttpServer(): https.Server | http.Server {
    if (process.env.PROTOCOL === "https") {
      return this.httpsServer;
    } else {
      return this.httpServer;
    }
  }
}

export default Server;
