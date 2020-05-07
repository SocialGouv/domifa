import { ValidationPipe } from "@nestjs/common";
import { NestFactory } from "@nestjs/core";
import Sentry = require("@sentry/node");
import * as compression from "compression";
import { config } from "dotenv";
import { AppModule } from "./app.module";

export async function bootstrap() {
  config();

  Sentry.init({
    dsn: process.env.SENTRY_DSN,
    release: "domifa@" + process.env.npm_package_version,
    serverName: process.env.BA,
  });

  const app = await NestFactory.create(AppModule, { cors: true });
  app.useGlobalPipes(new ValidationPipe());
  app.use(compression());
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
    })
  );
  await app.listen(3000);
}
bootstrap();
