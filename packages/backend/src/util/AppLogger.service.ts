import pino, { Logger } from "pino";
import * as pinoSerializers from "pino-std-serializers";
import pinoCaller from "pino-caller";
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

class Store {
  constructor(public logger: Logger) {}
}

const requestContextStorage = new AsyncLocalStorage<Store>();

const rootLogger = pinoCaller(pino());

function log(
  logger: Logger,
  level: string,
  message: string,
  context?: Record<string, any>,
  error?: any | Error
) {
  const severityLevel: SeverityLevel =
    level === "warn" ? "warning" : (level as SeverityLevel);
  addBreadcrumb({ level: severityLevel, message, data: context });

  if (level === "error") {
    if (error) {
      captureException(error, { level, contexts: context });
    } else {
      captureMessage(message, { level, contexts: context });
    }
  }

  if (error) {
    logger[level](error, { ...context, message });
  } else {
    logger[level]({ ...context }, message);
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

function httpLogger(req: RequestWithId, res: Response, next: NextFunction) {
  req.id = req.headers["X-Request-Id"] || randomUUID();
  const startTime = Date.now();

  const requestLogger = rootLogger.child(
    {
      req,
      apm: apm.currentTraceIds,
    },
    { serializers: { req: pinoSerializers.req, res: pinoSerializers.res } }
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
