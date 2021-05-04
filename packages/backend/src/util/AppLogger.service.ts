import { Logger } from "@nestjs/common";
import * as Sentry from "@sentry/node";
import { domifaConfig } from "../config";

class AppLogger {
  debug(message: string, context?: string) {
    Logger.debug(message, context);
  }
  warn(
    message: string,
    {
      sentryBreadcrumb,
      context,
      extra,
    }: {
      sentryBreadcrumb?: boolean;
      context?: string;
      extra?: { [attr: string]: any };
    } = {
      sentryBreadcrumb: false,
    }
  ) {
    if (sentryBreadcrumb && domifaConfig().dev.sentry.enabled) {
      // add breadcrumb to sentry
      // FIXME il y a eu confusion entre contexts et extra, service à refactorer
      const sentryExtra = extra
        ? extra
        : context
        ? { extraInfo: context }
        : undefined;
      const breadcrumb: Sentry.Breadcrumb = {
        level: Sentry.Severity.Warning,
        message,
        data: sentryExtra,
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
      extra,
      sentry,
    }: {
      error?: Error;
      context?: string;
      extra?: { [attr: string]: any };
      sentry: boolean;
    } = {
      sentry: true,
    }
  ) {
    if (sentry && domifaConfig().dev.sentry.enabled) {
      // log to sentry
      const contexts = context ? { context } : (undefined as {});
      // FIXME il y a eu confusion entre contexts et extra, service à refactorer
      const sentryExtra = extra
        ? extra
        : context
        ? { extraInfo: context }
        : undefined;
      if (error) {
        Sentry.captureException(error, {
          level: Sentry.Severity.Error,
          contexts,
          extra: sentryExtra,
        });
      } else {
        Sentry.captureMessage(message, {
          level: Sentry.Severity.Error,
          contexts,
          extra: sentryExtra,
        });
      }
    }
    Logger.error(message, error?.stack, JSON.stringify({ context, extra }));
  }
}

export const appLogger = new AppLogger();
