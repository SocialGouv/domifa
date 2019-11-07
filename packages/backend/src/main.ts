import { ValidationPipe } from "@nestjs/common";
import { NestFactory } from "@nestjs/core";
import Sentry = require("@sentry/node");
import { AppModule } from "./app.module";
import { config } from "dotenv";

export async function bootstrap() {
  config();

  Sentry.init({
    dsn:
      "https://dfbf0028aa3e410081dcd356dac0490e@sentry.tools.factory.social.gouv.fr/30"
  });

  const app = await NestFactory.create(AppModule);
  app.useGlobalPipes(new ValidationPipe());
  app.enableCors();
  await app.listen(3000);
}
bootstrap();
