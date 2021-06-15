import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from "@nestjs/common";
import * as Sentry from "@sentry/node";
import { Observable, throwError } from "rxjs";
import { catchError } from "rxjs/operators";
import { AppAuthUser } from "../../_common/model";

@Injectable()
export class AppSentryInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    // https://docs.nestjs.com/interceptors#exception-mapping
    return next.handle().pipe(
      catchError((err) => {
        try {
          Sentry.withScope((scope) => {
            let prefix: string;
            switch (context.getType()) {
              case "http":
                {
                  prefix = "[http]";

                  const { req, user } = parseRequest(context, scope);
                  logSentryRequest({ req, scope });
                  logSentryUser({ user, scope });
                }
                break;
              default: {
                prefix = "[core]";
              }
            }
            Sentry.captureException(err, {
              level: Sentry.Severity.Warning,
            });
            Sentry.captureMessage(
              `${prefix} ${
                err.message ?? "unexpected error"
              } ${new Date().toUTCString()}`,
              {
                level: Sentry.Severity.Error,
              }
            );
          });
        } catch (err) {
          console.error(
            "[AppSentryInterceptor] Unexpected error while processing sentry event",
            err
          );
        }
        // re-throw original error
        return throwError(err);
      })
    );
  }
}
function parseRequest(context: ExecutionContext, scope: Sentry.Scope) {
  const httpContext = context.switchToHttp();
  const expressRequest: Sentry.Handlers.ExpressRequest =
    httpContext.getRequest();
  if (expressRequest) {
    const data = Sentry.Handlers.parseRequest({}, expressRequest, {
      request: true,
      user: false,
    });
    const req = data.request;

    const user = expressRequest.user as AppAuthUser;

    return {
      req,
      user,
    };
  }
}

function logSentryRequest({
  req,
  scope,
}: {
  req: Sentry.Request;
  scope: Sentry.Scope;
}) {
  if (req) {
    const headers = req.headers ?? {};

    scope.setExtra("req", {
      method: req.method,
      url: req.url,
      headers: {
        host: headers.host,
        origin: headers.origin,
        referer: headers.referer,
        "user-agent": req.headers["user-agent"],
        withAuthorizationToken: headers.authorization !== undefined,
      },
    });
  }
}
function logSentryUser({
  user,
  scope,
}: {
  user: AppAuthUser;
  scope: Sentry.Scope;
}) {
  if (user) {
    scope.setExtra("user", {
      id: user.id,
      role: user.role,
      structureId: user.structureId,
    });
    scope.setTags({
      userId: user.id,
      userRole: user.role,
      structureId: user.structureId,
    });
  }
}
