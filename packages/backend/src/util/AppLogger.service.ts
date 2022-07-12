import pino, { Logger, SerializedRequest } from "pino";
import * as pinoSerializers from "pino-std-serializers";
import logCaller from "./logCaller";
import { apm } from "../instrumentation";
import { randomUUID } from "crypto";
import { NextFunction, Request, Response } from "express";
import { AsyncLocalStorage } from "async_hooks";
import { INestApplication, LoggerService } from "@nestjs/common";
import {
  addBreadcrumb,
  captureException,
  captureMessage,
  SeverityLevel,
} from "@sentry/node";
import { domifaConfig } from "../config";
import { IncomingMessage } from "http";

class Store {
  constructor(public logger: Logger) {}
}

const requestContextStorage = new AsyncLocalStorage<Store>();

const rootLogger = logCaller(pino());

function log(
  logger: Logger,
  level: string,
  message: string,
  options?: {
    context?: Record<string, any>;
    error?: any | Error;
    sentry?: boolean;
  }
) {
  const severityLevel: SeverityLevel =
    level === "warn" ? "warning" : (level as SeverityLevel);

  if (options?.sentry) {
    if (level === "error") {
      if (options?.error) {
        captureException(options?.error, { level, contexts: options?.context });
      } else {
        captureMessage(message, { level, contexts: options?.context });
      }
    } else {
      addBreadcrumb({ level: severityLevel, message, data: options?.context });
    }
  }

  if (options?.error) {
    logger[level]({ err: options?.error, ...options?.context }, message);
  } else {
    logger[level]({ ...options?.context }, message);
  }
}

function getLogger(_target: any, name: string) {
  const logger = requestContextStorage.getStore()?.logger || rootLogger;
  return log.bind(null, logger, name);
}

// Main app logger, using either rootLogger if not inside a request, or a child logger stored in requestContextStorage
export const appLogger = new Proxy(rootLogger, { get: getLogger });

export function addLogContext(fields: pino.Bindings) {
  const store = requestContextStorage.getStore();
  if (store) {
    store.logger = store.logger.child(fields);
  } else {
    rootLogger.warn("Unable to add log context out of request scope");
  }
}

type RequestWithId = Request & { id: string | string[] };

function redactAuthorizationHeader(req: SerializedRequest): SerializedRequest {
  const authorization = req.headers.authorization;
  if (authorization) {
    req.headers = {
      ...req.headers,
      authorization: `${authorization.slice(0, 10)}-REDACTED`,
    };
  }
  return req;
}

function httpLogger(req: RequestWithId, res: Response, next: NextFunction) {
  req.id = req.headers["X-Request-Id"] || randomUUID();
  const startTime = Date.now();

  const requestLogger = rootLogger.child(
    {
      req,
      apm: apm.currentTraceIds,
    },
    {
      serializers: {
        req: (request: IncomingMessage) =>
          redactAuthorizationHeader(pinoSerializers.req(request)),
        res: pinoSerializers.res,
      },
    }
  );

  function onResFinished() {
    res.removeListener("close", onResFinished);
    res.removeListener("error", onResFinished);
    res.removeListener("finish", onResFinished);

    const responseTime = Date.now() - startTime;

    const store = requestContextStorage.getStore();

    if (store) {
      store.logger.info({ res, responseTime }, "http_request");
    } else {
      rootLogger.warn({ responseTime }, "http_request NO CONTEXT");
    }
  }

  res.on("close", onResFinished);
  res.on("finish", onResFinished);
  res.on("error", onResFinished);

  // @ts-ignore: run requires arguments for next but should not because it can
  // be called without arguments
  requestContextStorage.run(new Store(requestLogger), next);
}

export function setupLog(app: INestApplication) {
  if (domifaConfig().logger.logHttpRequests) {
    app.use(httpLogger);
  }

  // use a custom nestjs logger to forward logs (and especially caught errors) to our pino logger
  app.useLogger(new NestjsLoggerWrapper());
}

class NestjsLoggerWrapper implements LoggerService {
  log(message: any, ...optionalParams: any[]) {
    appLogger.info(message, optionalParams);
  }
  error(message: any, ...optionalParams: any[]) {
    appLogger.error(message, optionalParams);
  }
  warn(message: any, ...optionalParams: any[]) {
    appLogger.warn(message, optionalParams);
  }
  debug?(message: any, optionalParams: any[]) {
    appLogger.debug(message, optionalParams);
  }
  verbose?(message: any, ...optionalParams: any[]) {
    appLogger.debug(message, optionalParams);
  }
}
