import { init, captureMessage } from "@sentry/nestjs";
import { domifaConfig } from "./config";
import { appLogger } from "./util";
import { format } from "date-fns";

if (domifaConfig().dev.sentry.enabled) {
  init({
    debug: domifaConfig().dev.sentry.debugModeEnabled,
    dsn: domifaConfig().dev.sentry.sentryDsn,
    environment: domifaConfig().envId,
    tracesSampleRate: 1.0,
    profilesSampleRate: 1,
  });

  appLogger.warn(`SENTRY DNS enabled: ${domifaConfig().dev.sentry.sentryDsn}`);

  if (domifaConfig().envId === "prod") {
    captureMessage(
      `[API START] [${domifaConfig().envId}] [CRON=${
        domifaConfig().cron.enable ? "ON" : "OFF"
      }] ${format(new Date(), "dd/MM/yyyy - HH:mm")}`
    );
  }
}
