import { Logger, ValidationPipe } from "@nestjs/common";
import { NestFactory } from "@nestjs/core";
import { DocumentBuilder, SwaggerModule } from "@nestjs/swagger";
import * as compression from "compression";
import { config as loadConfig } from "dotenv";
import { AppModule } from "./app.module";
import Sentry = require("@sentry/node");
import { ConfigService } from "./config/config.service";

export async function bootstrapApplication() {
  loadConfig();

  Sentry.init({
    dsn: process.env.SENTRY_DSN,
    release: "domifa@" + process.env.npm_package_version,
    serverName: process.env.BA,
  });

  const app = await NestFactory.create(AppModule);
  app.useGlobalPipes(new ValidationPipe());
  app.enableCors();
  app.use(compression());

  const config = new ConfigService();

  if (config.get("SWAGGER_UI_ENABLE") === "true") {
    // enable swagger ui http://localhost:3000/api-json & http://localhost:3000/api
    Logger.warn(`Swagger UI enabled: http://${config.get("DOMAIN")}:3000/api`);
    Logger.warn(
      `Swagger JSON download: http://${config.get("DOMAIN")}:3000/api-json`
    );
    const options = new DocumentBuilder()
      .setTitle("Domifa")
      .setDescription("API description")
      .setVersion("1.0")
      // .addTag("xxx")
      .build();
    const document = SwaggerModule.createDocument(app, options);
    SwaggerModule.setup("api", app, document);
  }

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
    })
  );

  return app;
}
