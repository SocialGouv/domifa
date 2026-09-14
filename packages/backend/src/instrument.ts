import { init, captureMessage, httpIntegration } from "@sentry/nestjs";
import { domifaConfig } from "./config";
import {
  appLogger,
  SENTRY_HEADERS,
  sanitizeErrorEvent,
  sanitizeSentryBreadcrumb,
  sanitizeTransactionEvent,
} from "./util";
import { format } from "date-fns";

if (domifaConfig().dev.sentry.enabled) {
  init({
    debug: domifaConfig().dev.sentry.debugModeEnabled,
    dsn: domifaConfig().dev.sentry.sentryDsn,
    environment: domifaConfig().envId,
    tracesSampleRate: 1.0,
    profilesSampleRate: 1,
    dataCollection: {
      userInfo: false,
      cookies: false,
      httpHeaders: {
        request: { allow: [...SENTRY_HEADERS] },
        response: false,
      },
      httpBodies: ["incomingRequest"],
      urlQueryParams: false,
      databaseQueryData: false,
      stackFrameVariables: false,
    },
    integrations: [httpIntegration({ maxIncomingRequestBodySize: "medium" })],
    beforeSend: sanitizeErrorEvent,
    beforeSendTransaction: sanitizeTransactionEvent,
    beforeBreadcrumb: sanitizeSentryBreadcrumb,
  });

  appLogger.warn("Sentry enabled");

  if (domifaConfig().envId === "prod") {
    captureMessage(
      `[API START] [${domifaConfig().envId}] [CRON=${
        domifaConfig().cron.enable ? "ON" : "OFF"
      }] ${format(new Date(), "dd/MM/yyyy - HH:mm")}`
    );
  }
}
