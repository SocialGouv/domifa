import { INestApplication, ValidationPipe } from "@nestjs/common";
import { NestFactory } from "@nestjs/core";

import { DataSource } from "typeorm";
import { AppModule } from "./app.module";
import { appHolder } from "./appHolder";
import { domifaConfig } from "./config";
import { appTypeormManager } from "./database";

import { AppSentryInterceptor } from "./util/sentry";
import compression from "compression";
import cookieParser from "cookie-parser";
import { setupLog, appLogger } from "./util";

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
    setupLog(app);

    // Trust first proxy (nginx ingress) so req.ip returns the real client IP
    // Required for throttling, logging, and security behind a reverse proxy
    app.getHttpAdapter().getInstance().set("trust proxy", 1);

    if (domifaConfig().dev.sentry.enabled) {
      app.useGlobalInterceptors(new AppSentryInterceptor());
    }

    appHolder.app = app;

    const frontendUrl = domifaConfig().apps.frontendUrl;
    const portailUsagersUrl = domifaConfig().apps.portailUsagersUrl;
    const portailAdminUrl = domifaConfig().apps.portailAdminUrl;
    const portailStatsUrl = domifaConfig().apps.portailStatsUrl;

    const whitelist = [
      frontendUrl.slice(0, -1),
      portailUsagersUrl.slice(0, -1),
      portailAdminUrl.slice(0, -1),
      portailStatsUrl.slice(0, -1),
    ];

    if (["dev", "local", "test"].includes(domifaConfig().envId)) {
      app.enableCors({
        origin: true, // "Access-Control-Allow-Origin" = request.origin (unsecure): https://docs.nestjs.com/techniques/security#cors
        credentials: true,
      });
    } else {
      app.enableCors({
        origin: whitelist,
        credentials: true,
        maxAge: 600,
      });
    }

    app.use(compression());
    app.use(cookieParser());
    app.getHttpAdapter().getInstance().disable("x-powered-by");

    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        stopAtFirstError: true,
        enableDebugMessages: true,
        disableErrorMessages: domifaConfig().envId !== "local",
        transform: true,
        transformOptions: {
          enableImplicitConversion: false,
        },
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
