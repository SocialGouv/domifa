import { Logger, ValidationPipe } from "@nestjs/common";
import { NestFactory } from "@nestjs/core";
import {
  DocumentBuilder,
  SwaggerCustomOptions,
  SwaggerModule,
} from "@nestjs/swagger";
import * as compression from "compression";
import { config as loadConfig } from "dotenv";
import { AppModule } from "./app.module";
import Sentry = require("@sentry/node");
import { ConfigService } from "./config/config.service";

export async function bootstrapApplication() {
  loadConfig();

  const app = await NestFactory.create(AppModule);
  app.useGlobalPipes(new ValidationPipe());
  app.enableCors();
  app.use(compression());

  const config = new ConfigService();

  Sentry.init({
    dsn: process.env.SENTRY_DSN,
    release: "domifa@" + process.env.npm_package_version,
    serverName: config.getEnvId(),
  });

  const DOMIFA_SWAGGER_CONTEXT = "sw-api";
  if (config.get("DOMIFA_SWAGGER_ENABLE") === "true") {
    // enable swagger ui http://localhost:3000/api-json & http://localhost:3000/${DOMIFA_SWAGGER_CONTEXT}
    Logger.warn(
      `Swagger UI enabled: ${config.get(
        "DOMIFA_BACKEND_URL"
      )}${DOMIFA_SWAGGER_CONTEXT}`
    );
    Logger.warn(
      `Swagger JSON download: ${config.get(
        "DOMIFA_BACKEND_URL"
      )}${DOMIFA_SWAGGER_CONTEXT}-json`
    );
    const options = new DocumentBuilder()
      .setTitle("Domifa")
      .setDescription("API description")
      .setVersion("1.0")
      // .addTag("xxx")
      .build();
    const document = SwaggerModule.createDocument(app, options);
    const swaggerOptions: SwaggerCustomOptions = {};
    SwaggerModule.setup(DOMIFA_SWAGGER_CONTEXT, app, document, swaggerOptions);
  }

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
    })
  );

  return app;
}
