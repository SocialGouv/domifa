import { pino, Logger, LoggerOptions } from "pino";
import * as pinoSerializers from "pino-std-serializers";
import traceCaller from "./traceCaller";
import { randomUUID } from "node:crypto";
import { NextFunction, Request, Response } from "express";
import { AsyncLocalStorage } from "node:async_hooks";
import { INestApplication, LoggerService } from "@nestjs/common";
import validator from "validator";
import {
  addBreadcrumb,
  captureException,
  captureMessage,
  SeverityLevel,
} from "@sentry/nestjs";
import { IncomingMessage, ServerResponse } from "node:http";
import { isAxiosError } from "axios";
import { domifaConfig } from "../../config";
import {
  HTTP_LOG_HEADERS,
  pickLoggableHeaders,
  sanitizeLogValue,
} from "../express";

class Store {
  constructor(public logger: Logger) {}
}

const requestContextStorage = new AsyncLocalStorage<Store>();

const SENSITIVE_KEYS = [
  "password",
  "passwordConfirmation",
  "oldPassword",
  "newPassword",
  "token",
  "trustToken",
  "otpCode",
  "secret",
  "ssn",
];

export const SECRET_KEY_PATTERN =
  /pass|token|secret|otp|ssn|credential|api[-_]?key|authorization|cookie/i;

const PERSONAL_DATA_KEYS = new Set(
  [
    "nom",
    "prenom",
    "surnom",
    "fullName",
    "userName",
    "senderName",
    "dateNaissance",
    "villeNaissance",
    "email",
    "userEmail",
    "login",
    "identifier",
    "telephone",
    "phone",
    "numero",
    "adresse",
    "adresseCourrier",
    "complementAdresse",
    "commentaire",
    "commentaires",
    "content",
    "message",
    "description",
    "searchString",
  ].map((key) => key.toLowerCase())
);

const FREE_TEXT_KEY_PATTERN = /(detail|details|other)$/i;

const SUSPICIOUS_VALUE_PATTERN =
  /<\/?[a-z!]|javascript:|\$\{|\{\{|\.\.[/\\]|\/\*|--|'\s*(or|and)\s|\bunion\b[\s\S]*\bselect\b|\bsleep\s*\(/i;

const BODY_MAX_DEPTH = 8;
const BODY_MAX_ARRAY_ITEMS = 20;
const BODY_MAX_STRING_LENGTH = 512;

export const pinoOptions: LoggerOptions = {
  redact: {
    paths: SENSITIVE_KEYS.flatMap((key) => [key, `*.${key}`]),
    censor: redactLogValue,
  },
  serializers: {
    req: serializeRequest,
    res: serializeResponse,
    err: serializeError,
    body: serializeBody,
  },
};

const rootLogger: Logger = traceCaller(pino(pinoOptions));

function log(
  logger: Logger,
  level: string,
  message: string | Error,
  options?: {
    context?: Record<string, any>;
    error?: any | Error;
    sentry?: boolean;
  }
) {
  if (message instanceof Error) {
    options = { ...options, error: options?.error ?? message };
    message = message.message;
  }

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
export const appLogger: Logger = new Proxy(rootLogger, { get: getLogger });

export function addLogContext(fields: pino.Bindings) {
  const store = requestContextStorage.getStore();
  if (store) {
    store.logger = store.logger.child(fields);
  }
}

type RequestWithId = Request & { id: string | string[] };

const SENSITIVE_URL_PATTERN =
  /\/(check-password-token|reset-password|confirm-email-update|delete|enable)\/([^/?#]+)\/[^/?#]+/g;

export function redactSensitiveUrl(url: string): string {
  return url.replace(SENSITIVE_URL_PATTERN, "/$1/$2/[REDACTED]");
}

export function redactLogValue(value: unknown): string {
  if (typeof value !== "string") {
    if (value === null || value === undefined) {
      return "[REDACTED]";
    }
    return `[REDACTED:${Array.isArray(value) ? "array" : typeof value}]`;
  }
  if (value.startsWith("[REDACTED")) {
    return value;
  }
  if (SUSPICIOUS_VALUE_PATTERN.test(value)) {
    return "[REDACTED:SUSPICIOUS]";
  }
  return "[REDACTED]";
}

function isSensitiveLogKey(key: string): boolean {
  return (
    SECRET_KEY_PATTERN.test(key) ||
    FREE_TEXT_KEY_PATTERN.test(key) ||
    PERSONAL_DATA_KEYS.has(key.toLowerCase())
  );
}

export function redactLogValues(
  value: unknown,
  depth = 0,
  sensitive = false
): unknown {
  if (value === null || typeof value !== "object") {
    if (sensitive) {
      return redactLogValue(value);
    }
    if (typeof value === "string" && value.length > BODY_MAX_STRING_LENGTH) {
      return `${value.slice(0, BODY_MAX_STRING_LENGTH)}[TRUNCATED]`;
    }
    return value;
  }
  if (depth >= BODY_MAX_DEPTH) {
    return "[TRUNCATED]";
  }
  if (Array.isArray(value)) {
    const items = value
      .slice(0, BODY_MAX_ARRAY_ITEMS)
      .map((item) => redactLogValues(item, depth + 1, sensitive));
    if (value.length > BODY_MAX_ARRAY_ITEMS) {
      items.push(`[+${value.length - BODY_MAX_ARRAY_ITEMS} items]`);
    }
    return items;
  }
  const redacted: Record<string, unknown> = {};
  for (const [key, item] of Object.entries(value)) {
    redacted[key] = redactLogValues(
      item,
      depth + 1,
      sensitive || isSensitiveLogKey(key)
    );
  }
  return redacted;
}

export function serializeBody(body: unknown): unknown {
  if (Buffer.isBuffer(body)) {
    return "[BINARY BODY]";
  }
  if (
    body === null ||
    typeof body !== "object" ||
    Object.keys(body).length === 0
  ) {
    return undefined;
  }
  return redactLogValues(body);
}

export function serializeRequest(
  req: IncomingMessage & { id?: string | string[] }
) {
  const url = sanitizeLogValue(req.url);
  const headers = pickLoggableHeaders(req.headers ?? {}, HTTP_LOG_HEADERS);
  if (headers.referer) {
    headers.referer = redactSensitiveUrl(headers.referer);
  }
  return {
    id: req.id,
    method: req.method,
    url: url ? redactSensitiveUrl(url) : undefined,
    headers,
    remoteAddress: req.socket?.remoteAddress,
    remotePort: req.socket?.remotePort,
  };
}

export function serializeResponse(res: ServerResponse) {
  return {
    statusCode: res.statusCode,
  };
}

export function serializeError(error: unknown) {
  if (isAxiosError(error)) {
    return {
      type: "AxiosError",
      message: error.message,
      code: error.code,
      status: error.response?.status,
      method: error.config?.method,
      url: error.config?.url?.split("?")[0],
      stack: error.stack,
    };
  }
  if (error instanceof Error) {
    return pinoSerializers.err(error);
  }
  return error;
}

// Alphanumeric + hyphen, capped at 64 chars. The id ends up in log lines and
// downstream tracing; an attacker-controlled header could otherwise carry
// control chars (CRLF injection in non-JSON sinks), oversize payloads, or
// SQL-style payloads like CHAR(0x...) chained through log aggregators.
function readRequestId(req: RequestWithId): string {
  const raw = req.headers["X-Request-Id"];
  if (typeof raw !== "string") {
    return randomUUID();
  }
  if (!validator.isLength(raw, { min: 1, max: 64 })) {
    return randomUUID();
  }
  if (!validator.matches(raw, /^[a-zA-Z0-9-]+$/)) {
    return randomUUID();
  }
  return raw;
}

function httpLogger(req: RequestWithId, res: Response, next: NextFunction) {
  req.id = readRequestId(req);
  const startTime = Date.now();

  const requestLogger = rootLogger.child({ req });

  function onResFinished() {
    res.removeListener("close", onResFinished);
    res.removeListener("error", onResFinished);
    res.removeListener("finish", onResFinished);

    const responseTime = Date.now() - startTime;
    const route: string | undefined = req.route?.path;

    const store = requestContextStorage.getStore();

    if (store) {
      store.logger.info(
        { route, res, responseTime, body: req.body },
        "http_request"
      );
    } else {
      rootLogger.warn(
        { route, responseTime, body: req.body },
        "http_request NO CONTEXT"
      );
    }
  }

  res.on("close", onResFinished);
  res.on("finish", onResFinished);
  res.on("error", onResFinished);

  // be called without arguments
  requestContextStorage.run(new Store(requestLogger), next, null);
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
