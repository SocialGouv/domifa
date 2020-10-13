import { Logger } from "@nestjs/common";
import * as Sentry from "@sentry/node";

class AppLogger {
  debug(message: string, context?: string) {
    Logger.debug(message, context);
  }
  warn(
    message: string,
    {
      sentryBreadcrumb,
      context,
    }: {
      sentryBreadcrumb?: boolean;
      context?: string;
    } = {
      sentryBreadcrumb: false,
    }
  ) {
    if (sentryBreadcrumb) {
      // add breadcrumb to sentry
      const breadcrumb: Sentry.Breadcrumb = {
        level: Sentry.Severity.Warning,
        message,
      };
      Sentry.addBreadcrumb(breadcrumb);
    }
    Logger.warn(message, context);
  }
  error(
    message: string,
    {
      error,
      context,
      sentry,
    }: {
      error?: Error;
      context?: string;
      sentry: boolean;
    } = {
      sentry: true,
    }
  ) {
    if (sentry) {
      // log to sentry
      if (error) {
        Sentry.captureException(error, {
          level: Sentry.Severity.Error,
          contexts: { context, message },
        });
      } else {
        Sentry.captureMessage(message, {
          level: Sentry.Severity.Error,
          contexts: { context },
        });
      }
    }
    Logger.error(message, error?.stack, context);
  }
}

export const appLogger = new AppLogger();
