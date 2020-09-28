import { Logger, ValidationPipe } from "@nestjs/common";
import { NestFactory } from "@nestjs/core";
import Sentry = require("@sentry/node");
import * as compression from "compression";
import { config } from "dotenv";
import { AppModule } from "./app.module";
import { umzugMigrationManager } from "./_migrations/umzug-migration-manager";

export async function bootstrapApplication() {
  config();

  Sentry.init({
    dsn: process.env.SENTRY_DSN,
    release: "domifa@" + process.env.npm_package_version,
    serverName: process.env.BA,
  });

  const app = await NestFactory.create(AppModule);
  app.useGlobalPipes(new ValidationPipe());
  app.enableCors();
  app.use(compression());

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
    })
  );

  return app;
}
