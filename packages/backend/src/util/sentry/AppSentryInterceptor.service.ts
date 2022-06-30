import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from "@nestjs/common";
import {
  addRequestDataToEvent,
  captureException,
  captureMessage,
  CrossPlatformRequest,
  Scope,
  withScope,
} from "@sentry/node";

import { Observable, throwError } from "rxjs";
import { catchError } from "rxjs/operators";
import { UserStructureAuthenticated } from "../../_common/model";

@Injectable()
export class AppSentryInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    // https://docs.nestjs.com/interceptors#exception-mapping
    return next.handle().pipe(
      catchError((err) => {
        try {
          withScope((scope) => {
            let prefix: string;
            switch (context.getType()) {
              case "http":
                {
                  prefix = "[http]";

                  const { req, user } = parseRequest(context);
                  logSentryRequest({ req, scope });
                  logSentryUser({ user, scope });
                }
                break;
              default: {
                prefix = "[core]";
              }
            }

            captureException(err, {
              level: "warning",
            });

            captureMessage(
              `${prefix} ${
                err.message ?? "unexpected error"
              } ${new Date().toUTCString()}`,
              {
                level: "error",
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
        return throwError(() => new Error(err));
      })
    );
  }
}

function parseRequest(context: ExecutionContext) {
  const httpContext = context.switchToHttp();
  const expressRequest: CrossPlatformRequest = httpContext.getRequest();
  if (expressRequest) {
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
}

function logSentryRequest({
  req,
  scope,
}: {
  req: CrossPlatformRequest;
  scope: Scope;
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
      body: JSON.stringify(req.body),
    });
  }
}

function logSentryUser({
  user,
  scope,
}: {
  user: UserStructureAuthenticated;
  scope: Scope;
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
