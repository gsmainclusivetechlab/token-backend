import express, { Application, NextFunction, Request, Response } from 'express';
import bodyParser from 'body-parser';
import http from 'http';
import https from 'https';
import { UserFacingError } from '../classes/errors';
import { LogLevels, logService } from '../services/log.service';
import { Connection, createConnection } from 'mysql';
import swaggerUi from 'swagger-ui-express';
import swaggerJSDoc from 'swagger-jsdoc';

export var db: Connection;

const errorHandler = (err: any, req: any, res: any, next: any) => {
  logService.log(LogLevels.WARNING, `Catch all errors`);
  if (err instanceof UserFacingError) {
    res.status(400).send({ error: err.message || 'Something went wrong' });
    return;
  }

  logService.log(LogLevels.ERROR, `Bubbled up error`, [err.message, err.stack]);
  if (err.name === 'UnauthorizedError') {
    res.status(401).send({ error: err.message });
    return;
  }
  if (res.headersSent) {
    return next(err);
  }
  res.status(500);
  if (process.env.NODE_ENV === 'development') {
    res.send({
      error: 'Something went wrong',
      realErrorDevelopment: {
        message: err.message,
        stack: err.stack,
      },
    });
  } else {
    // Do not send stack traces or expose code to the client
    res.send({ error: 'Something went wrong' });
  }
};

const notFoundHandler = (req: Request, res: Response, next: NextFunction) => {
  logService.log(LogLevels.WARNING, `Bubbled up 404 error`, req.originalUrl);
  res.status(404).send({ code: 404, msg: 'Not Found' });
};

class Server {
  protected app: Application;
  protected httpServer: http.Server;
  protected httpsServer: https.Server;
  private routes: string[] = [];
  public port: number | string;

  constructor(port: number | string = 4400) {
    this.app = express();
    this.port = port;
    this.app.set('port', port);
    this.config();
    this.connectDB();
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
  }

  private connectDB() {
    db = createConnection({
      host: process.env.HOST,
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_DATABASE,
    });
    db.connect();
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
        title: 'Token API',
        version: '1.0.0',
      },
      servers: [
        {
          url: 'http://localhost:3700',
          description: 'Development server',
        },
      ],
    };

    const options = {
      swaggerDefinition,
      apis: [`${__dirname}/../routes/*.ts`, `${__dirname}/../routes/*.js`],
    };

    const swaggerSpec = swaggerJSDoc(options);
    this.routes.push('/docs');
    this.app.use('/docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));
  }

  // Exposed public routes (service discovery)
  public getRoutes(): string[] {
    return ['/health'];
  }

  public addErrorHandler() {
    this.app.use(errorHandler);
  }

  public add404Handler() {
    logService.log(LogLevels.WARNING, '404 Error Handler Attached');
    this.app.use(notFoundHandler);
  }

  public async start(): Promise<void> {
    const logLevel = process.env.LOG_LEVEL as LogLevels;
    this.getHttpServer().listen(this.app.get('port'), () => {
      logService.log(
        logLevel || LogLevels.DEBUG,
        `App is running at ${
          process.env.PROTOCOL || 'http'
        }://localhost:${this.app.get('port')} in ${this.app.get('env')} mode`
      );
      logService.log(LogLevels.DEBUG, `Press CTRL-C to stop`);
    });
  }

  private getServerInstance() {
    if (process.env.PROTOCOL === 'https') {
      const options = {};

      this.httpsServer = https.createServer(options, this.app);
      return this.httpsServer;
    } else {
      this.httpServer = http.createServer(this.app);
      return this.httpServer;
    }
  }

  public getHttpServer(): https.Server | http.Server {
    if (process.env.PROTOCOL === 'https') {
      return this.httpsServer;
    } else {
      return this.httpServer;
    }
  }
}

export default Server;
