import { INestApplication, ValidationPipe } from "@nestjs/common";
import { NestFactory } from "@nestjs/core";
import {
  DocumentBuilder,
  SwaggerCustomOptions,
  SwaggerModule,
} from "@nestjs/swagger";

import * as Sentry from "@sentry/node";
import {
  SentrySpanProcessor,
  SentryPropagator,
} from "@sentry/opentelemetry-node";

import * as opentelemetry from "@opentelemetry/sdk-node";
// require("@opentelemetry/api");
import { getNodeAutoInstrumentations } from "@opentelemetry/auto-instrumentations-node";
import { OTLPTraceExporter } from "@opentelemetry/exporter-trace-otlp-grpc";

import { format } from "date-fns";
import { DataSource } from "typeorm";
import { AppModule } from "./app.module";
import { appHolder } from "./appHolder";
import { domifaConfig } from "./config";
import { appTypeormManager } from "./database";
import { appLogger, setupLog } from "./util";
import { AppSentryInterceptor } from "./util/sentry";
import compression from "compression";

export async function tearDownApplication({
  app,
  postgresTypeormConnection,
}: {
  app: INestApplication;
  postgresTypeormConnection: DataSource;
}) {
  await app.close();
  await postgresTypeormConnection.destroy();
}

export async function bootstrapApplication(): Promise<{
  app: INestApplication;
  postgresTypeormConnection: DataSource;
}> {
  try {
    const postgresTypeormConnection = await appTypeormManager.connect();

    const app = await NestFactory.create(AppModule);
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
        instrumentations: [getNodeAutoInstrumentations()],

        // Sentry config
        spanProcessor: new SentrySpanProcessor(),
        textMapPropagator: new SentryPropagator(),
      });

      sdk.start();

      appLogger.warn(
        `SENTRY DNS enabled: ${domifaConfig().dev.sentry.sentryDsn}`
      );
      console.log(domifaConfig().dev.sentry.sentryDsn);

      Sentry.captureMessage("test dev");

      if (domifaConfig().envId === "prod") {
        Sentry.captureMessage(
          `[API START] [${domifaConfig().envId}] ${format(
            new Date(),
            "dd/MM/yyyy - HH:mm"
          )}`
        );
      }
    }

    setupLog(app);

    if (domifaConfig().dev.sentry.enabled) {
      app.useGlobalInterceptors(
        new AppSentryInterceptor() // remplace RavenInterceptor qui ne fonctionne plus
      );
    }

    appHolder.app = app;

    const frontendUrl = domifaConfig().apps.frontendUrl;
    const portailUsagersUrl = domifaConfig().apps.portailUsagersUrl;
    const portailAdminUrl = domifaConfig().apps.portailAdminUrl;

    const whitelist = [
      frontendUrl.slice(0, -1),
      portailUsagersUrl.slice(0, -1),
      portailAdminUrl.slice(0, -1),
    ];

    if (["dev", "local", "test"].includes(domifaConfig().envId)) {
      app.enableCors({
        origin: true, // "Access-Control-Allow-Origin" = request.origin (unsecure): https://docs.nestjs.com/techniques/security#cors
      });
    } else {
      app.enableCors({
        origin: whitelist,
      });
    }

    app.use(compression());

    configureSwagger(app);

    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        stopAtFirstError: true,
        enableDebugMessages: domifaConfig().envId !== "local",
        disableErrorMessages: domifaConfig().envId !== "local",
      })
    );

    return { app, postgresTypeormConnection };
  } catch (err) {
    // eslint:disable-next-line: no-console
    console.error("[bootstrapApplication] Error bootstraping application", err);
    appLogger.error("[bootstrapApplication] Error bootstraping application", {
      error: err as Error,
      sentry: true,
    });
    throw err;
  }
}

function configureSwagger(app: INestApplication) {
  const DOMIFA_SWAGGER_CONTEXT = "sw-api";
  if (domifaConfig().dev.swaggerEnabled) {
    const backendUrl = domifaConfig().apps.backendUrl;
    // enable swagger ui http://localhost:3000/api-json & http://localhost:3000/${DOMIFA_SWAGGER_CONTEXT}
    appLogger.warn(
      `Swagger UI enabled: ${backendUrl}${DOMIFA_SWAGGER_CONTEXT}`
    );

    appLogger.warn(
      `Swagger JSON download: ${backendUrl}${DOMIFA_SWAGGER_CONTEXT}-json`
    );
    const options = new DocumentBuilder()
      .setTitle("Domifa")
      .setDescription("API description")
      .setVersion("1.0")
      .addBearerAuth({
        type: "http",
        scheme: "bearer",
        bearerFormat: "JWT",
      })
      .build();

    const document = SwaggerModule.createDocument(app, options);
    const swaggerOptions: SwaggerCustomOptions = {};
    SwaggerModule.setup(DOMIFA_SWAGGER_CONTEXT, app, document, swaggerOptions);
  }
}
