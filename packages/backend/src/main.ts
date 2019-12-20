import { ValidationPipe } from "@nestjs/common";
import { NestFactory } from "@nestjs/core";
import Sentry = require("@sentry/node");
import { config } from "dotenv";
import { AppModule } from "./app.module";

export async function bootstrap() {
  config();

  Sentry.init({
    dsn: process.env.SENTRY_DSN,
    release: "domifa@" + process.env.npm_package_version
  });

  const app = await NestFactory.create(AppModule);
  app.useGlobalPipes(new ValidationPipe());
  app.enableCors();
  await app.listen(3000);
}
bootstrap();
