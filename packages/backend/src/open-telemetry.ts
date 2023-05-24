import * as Sentry from "@sentry/node";
import {
  SentrySpanProcessor,
  SentryPropagator,
} from "@sentry/opentelemetry-node";

import * as opentelemetry from "@opentelemetry/sdk-node";
import "@opentelemetry/api";

// Warning: don't use @opentelemetry/auto-instrumentations-node as it uses far too much memory at the start of the process
import { HttpInstrumentation } from "@opentelemetry/instrumentation-http";
import { ExpressInstrumentation } from "@opentelemetry/instrumentation-express";
import { NetInstrumentation } from "@opentelemetry/instrumentation-net";
import { PgInstrumentation } from "@opentelemetry/instrumentation-pg";
import { NestInstrumentation } from "@opentelemetry/instrumentation-nestjs-core";

import { OTLPTraceExporter } from "@opentelemetry/exporter-trace-otlp-grpc";

import { domifaConfig } from "./config";
import { appLogger } from "./util";
import { format } from "date-fns";

if (domifaConfig().dev.sentry.enabled) {
  Sentry.init({
    debug: domifaConfig().dev.sentry.debugModeEnabled,
    dsn: domifaConfig().dev.sentry.sentryDsn,
    environment: domifaConfig().envId,
    tracesSampleRate: 1.0,
    release: "domifa@" + domifaConfig().version, // default
    // set the instrumenter to use OpenTelemetry instead of Sentry because of NestJS not being compatible with sentry instrumentation
    instrumenter: "otel",
    // logLevels: domifaConfig().dev.sentry.debugModeEnabled
    //   ? ["log", "error", "warn", "debug", "verbose"] // Verbose,
    //   : ["log", "error", "warn", "debug"],
  });

  const sdk = new opentelemetry.NodeSDK({
    // Existing config
    traceExporter: new OTLPTraceExporter(),
    // instrumentations: [getNodeAutoInstrumentations()],
    instrumentations: [
      new HttpInstrumentation(),
      new ExpressInstrumentation(),
      new NetInstrumentation(),
      new PgInstrumentation(),
      new NestInstrumentation(),
    ],

    // Sentry config
    spanProcessor: new SentrySpanProcessor(),
    textMapPropagator: new SentryPropagator(),
  });

  sdk.start();

  appLogger.warn(`SENTRY DNS enabled: ${domifaConfig().dev.sentry.sentryDsn}`);

  if (domifaConfig().envId === "prod") {
    Sentry.captureMessage(
      `[API START] [${domifaConfig().envId}] ${format(
        new Date(),
        "dd/MM/yyyy - HH:mm"
      )}`
    );
  }
}
