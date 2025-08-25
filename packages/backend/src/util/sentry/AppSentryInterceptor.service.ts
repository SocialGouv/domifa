import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
  InternalServerErrorException,
} from "@nestjs/common";
import { getCurrentScope, captureException } from "@sentry/node";
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

        console.log(err);
        appLogger.error(`[http] ${err.message}`, { error: err });

        return throwError(() => new InternalServerErrorException());
      })
    );
  }
}
