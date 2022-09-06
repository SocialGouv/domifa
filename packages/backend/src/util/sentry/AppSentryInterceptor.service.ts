import {
  CallHandler,
  ExecutionContext,
  Injectable,
  InternalServerErrorException,
  NestInterceptor,
} from "@nestjs/common";
import { addRequestDataToEvent, CrossPlatformRequest } from "@sentry/node";

import { Observable, throwError } from "rxjs";
import { catchError } from "rxjs/operators";
import { UserStructureAuthenticated } from "../../_common/model";
import { appLogger } from "../AppLogger.service";

@Injectable()
export class AppSentryInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    // https://docs.nestjs.com/interceptors#exception-mapping
    return next.handle().pipe(
      catchError((err) => {
        try {
          let prefix: string;
          const logContext: Record<string, any> = {};

          switch (context.getType()) {
            case "http":
              {
                prefix = "[http]";

                const { req, user } = parseRequest(context);
                if (req) {
                  logContext.req = logSentryRequest(req);
                }
                if (user) {
                  logContext.user = logSentryUser(user);
                }
              }
              break;
            default: {
              prefix = "[core]";
            }
          }
          appLogger.error(
            `${prefix} ${
              err.message ?? "unexpected error"
            } ${new Date().toUTCString()}`,
            { error: err, sentry: true, context: logContext }
          );
        } catch (err) {
          appLogger.error(
            "[AppSentryInterceptor] Unexpected error while processing sentry event",
            { error: err, sentry: true }
          );
        }
        return throwError(() => new InternalServerErrorException());
      })
    );
  }
}

function parseRequest(context: ExecutionContext): {
  req: any;
  user: UserStructureAuthenticated;
} {
  const httpContext = context.switchToHttp();
  const expressRequest: CrossPlatformRequest = httpContext.getRequest();
  if (!expressRequest) {
    return null;
  }
  const data = addRequestDataToEvent({}, expressRequest, {
    include: {
      request: true,
      user: false,
    },
  });

  const req = data.request;
  const user = expressRequest.user as UserStructureAuthenticated;

  return {
    req,
    user,
  };
}

function logSentryRequest(req: CrossPlatformRequest): Record<string, any> {
  const headers = req.headers ?? {};

  return {
    method: req.method,
    url: req.url,
    headers: {
      host: headers.host,
      origin: headers.origin,
      referer: headers.referer,
      "user-agent": req.headers["user-agent"],
      withAuthorizationToken: headers.authorization !== undefined,
    },
    body: JSON.stringify(req.body),
  };
}

function logSentryUser(user: UserStructureAuthenticated): Record<string, any> {
  return {
    id: user.id,
    role: user.role,
    structureId: user.structureId,
  };
}
