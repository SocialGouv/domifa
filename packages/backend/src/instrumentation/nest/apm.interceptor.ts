import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
  HttpException,
} from "@nestjs/common";
import { Observable } from "rxjs";
import { catchError } from "rxjs/operators";
import { ApmService } from "./apm.service";

@Injectable()
export class ApmInterceptor implements NestInterceptor {
  constructor(private readonly apmService: ApmService) {}

  intercept(
    context: ExecutionContext,
    next: CallHandler
  ): Observable<Response> {
    return next.handle().pipe(
      catchError((error) => {
        if (error instanceof HttpException) {
          this.apmService.captureError(error.message);
        } else {
          this.apmService.captureError(error);
        }
        throw error;
      })
    );
  }
}
