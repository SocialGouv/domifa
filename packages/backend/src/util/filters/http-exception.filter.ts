import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
} from "@nestjs/common";
import { Response } from "express";
import { ApiMessage } from "@domifa/common";
import { domifaConfig } from "../../config";

const PROD_LIKE_ENV_IDS = ["prod", "preprod"];
const GENERIC_SERVER_ERROR_MESSAGE = "INTERNAL_SERVER_ERROR";

@Catch()
export class HttpExceptionFilter implements ExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost): void {
    const res = host.switchToHttp().getResponse<Response>();
    const isProdLike = PROD_LIKE_ENV_IDS.includes(domifaConfig().envId);

    if (exception instanceof HttpException) {
      const status = exception.getStatus();
      const message =
        status >= HttpStatus.INTERNAL_SERVER_ERROR && isProdLike
          ? GENERIC_SERVER_ERROR_MESSAGE
          : extractMessage(exception);

      const body: ApiMessage = { message };
      res.status(status).json(body);
      return;
    }

    // Non-HttpException = unexpected server bug. AppSentryInterceptor handles
    // capture/logging; here we only enforce a safe response shape.
    const message = isProdLike
      ? GENERIC_SERVER_ERROR_MESSAGE
      : (exception as Error)?.message ?? GENERIC_SERVER_ERROR_MESSAGE;

    const body: ApiMessage = { message };
    res.status(HttpStatus.INTERNAL_SERVER_ERROR).json(body);
  }
}

function extractMessage(exception: HttpException): string {
  const payload = exception.getResponse();

  if (typeof payload === "string") {
    return payload;
  }

  const candidate = (payload as { message?: string | string[] })?.message;

  if (Array.isArray(candidate)) {
    return candidate[0] ?? exception.message;
  }

  return candidate ?? exception.message;
}
