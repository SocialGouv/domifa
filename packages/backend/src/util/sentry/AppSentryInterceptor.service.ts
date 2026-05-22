import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
  HttpException,
} from "@nestjs/common";
import { getCurrentScope, captureException } from "@sentry/nestjs";
import { Observable, catchError, throwError } from "rxjs";
import { appLogger } from "../logs";
import {
  UserStructureAuthenticated,
  UserUsagerAuthenticated,
} from "../../_common/model";
import { UserSupervisorAuthenticated } from "../../_common/model/users/user-supervisor";

@Injectable()
export class AppSentryInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    return next.handle().pipe(
      catchError((err) => {
        // 4xx are expected client-side errors (auth challenges like
        // OTP_REQUIRED, validation, forbidden, ...). Re-throw untouched so
        // Nest's exception layer preserves the original status + body, and
        // skip Sentry capture so the dashboard stays focused on real bugs.
        if (err instanceof HttpException && err.getStatus() < 500) {
          return throwError(() => err);
        }

        const {
          user,
        }: {
          user:
            | UserStructureAuthenticated
            | UserSupervisorAuthenticated
            | UserUsagerAuthenticated;
        } = context.switchToHttp().getRequest();

        if (user?._userProfile === "structure") {
          getCurrentScope().setUser({
            id: user?.id,
            role: user?.role,
            userProfile: "structure",
            structureId: user?.structure,
          });
        } else if (user?._userProfile === "supervisor") {
          getCurrentScope().setUser({
            id: user?.id,
            role: user?.role,
            userProfile: user._userProfile,
          });
        } else if (user?._userProfile === "usager") {
          getCurrentScope().setUser({
            uuid: user.usager.uuid,
            id: user._userId,
            userProfile: user._userProfile,
          });
        }

        captureException(err);
        appLogger.error(`[http] ${err.message}`, { error: err });

        return throwError(() => err);
      })
    );
  }
}
