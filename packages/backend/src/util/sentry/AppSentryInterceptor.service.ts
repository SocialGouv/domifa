import {
  CallHandler,
  ExecutionContext,
  Injectable,
  InternalServerErrorException,
  NestInterceptor,
} from "@nestjs/common";
import { addRequestDataToEvent, Request as SentryRequest } from "@sentry/node";

import { Observable, throwError } from "rxjs";
import { catchError } from "rxjs/operators";
import { UserStructureAuthenticated } from "../../_common/model";
import { Request } from "express";
import { appLogger } from "../logs";

@Injectable()
export class AppSentryInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    // https://docs.nestjs.com/interceptors#exception-mapping
    return next.handle().pipe(
      catchError((err) => {
        try {
          let prefix: string;
          const logContext: Record<string, any> = {};

          if (context.getType() === "http") {
            prefix = "[http]";
            const { req, user } = parseRequest(context);
            if (req) {
              logContext.req = logSentryRequest(req);
            }
            if (user) {
              logContext.user = logSentryUser(user);
            }
          } else {
            prefix = "[core]";
          }

          appLogger.error(
            `${prefix} ${
              err.message ?? "unexpected error"
            } ${new Date().toUTCString()}`,
            { error: err, sentry: true, context: logContext }
          );
        } catch (error) {
          appLogger.error(
            "[AppSentryInterceptor] Unexpected error while processing sentry event",
            { error, sentry: true }
          );
        }
        return throwError(() => new InternalServerErrorException());
      })
    );
  }
}

function parseRequest(context: ExecutionContext): {
  req: SentryRequest;
  user: UserStructureAuthenticated;
} {
  const httpContext = context.switchToHttp();
  const expressRequest: Request = httpContext.getRequest();

  if (!expressRequest) {
    return null;
  }
  const data = addRequestDataToEvent({}, expressRequest, {
    include: {
      request: true,
      user: false,
      transaction: true,
    },
  });
  const req = data.request;
  const user = expressRequest.user as UserStructureAuthenticated;

  return {
    req,
    user,
  };
}

function logSentryRequest(req: any): Record<string, any> {
  const headers = req.headers ?? {};
  return {
    method: req.method,
    url: req.url,
    data: req?.data,
    headers: {
      host: headers.host,
      origin: headers.origin,
      referer: headers.referer,
      "user-agent": req.headers["user-agent"],
      withAuthorizationToken: headers.authorization !== undefined,
    },
  };
}

function logSentryUser(user: UserStructureAuthenticated): Record<string, any> {
  return {
    id: user.id,
    role: user.role,
    structureId: user.structureId,
  };
}
