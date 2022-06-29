import { ConsoleLogger } from "@nestjs/common";
import {
  addBreadcrumb,
  Breadcrumb,
  captureException,
  captureMessage,
} from "@sentry/node";

import { domifaConfig } from "../config";

class AppLogger {
  debug(message: string) {
    new ConsoleLogger().debug(message);
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

      const breadcrumb: Breadcrumb = {
        level: "warning",
        message,
        data: sentryExtra,
      };
      addBreadcrumb(breadcrumb);
    }
    new ConsoleLogger().warn(message);
  }
  error(
    message: string,
    {
      error,
      context,
      extra,
      sentry,
    }: {
      error?: any | Error;
      context?: string;
      extra?: { [attr: string]: any };
      sentry: boolean;
    } = {
      sentry: true,
    }
  ) {
    if (sentry && domifaConfig().dev.sentry.enabled) {
      // log to sentry
      // const contexts = context ? { context } : null;
      // FIXME il y a eu confusion entre contexts et extra, service à refactorer
      const sentryExtra = extra
        ? extra
        : context
        ? { extraInfo: context }
        : undefined;
      if (error) {
        captureException(error, {
          level: "error",
          extra: sentryExtra,
        });
      } else {
        captureMessage(message, {
          level: "error",
          // contexts,
          extra: sentryExtra,
        });
      }
    }
    new ConsoleLogger().error(
      message,
      error?.stack,
      JSON.stringify({ context, extra })
    );
  }
}

export const appLogger = new AppLogger();
