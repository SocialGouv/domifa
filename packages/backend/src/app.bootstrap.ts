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
import * as Sentry from "@sentry/node";
import { ConfigService } from "./config/config.service";
import { appLogger } from "./util";

export async function bootstrapApplication() {
  try {
    loadConfig();

    const config = new ConfigService();

    Sentry.init({
      dsn: process.env.SENTRY_DSN,
      release: "domifa@" + process.env.npm_package_version,
      serverName: config.getEnvId(),
    });

    const app = await NestFactory.create(AppModule);
    app.useGlobalPipes(new ValidationPipe());
    app.enableCors();
    app.use(compression());
    configureSwagger(config, app);

    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
      })
    );

    return app;
  } catch (err) {
    // tslint:disable-next-line: no-console
    console.error("[bootstrapApplication] Error bootstraping application", err);
    throw err;
  }
}

function configureSwagger(config: ConfigService, app) {
  const DOMIFA_SWAGGER_CONTEXT = "sw-api";
  if (config.getBoolean("DOMIFA_SWAGGER_ENABLE")) {
    // enable swagger ui http://localhost:3000/api-json & http://localhost:3000/${DOMIFA_SWAGGER_CONTEXT}
    appLogger.warn(
      `Swagger UI enabled: ${config.get(
        "DOMIFA_BACKEND_URL"
      )}${DOMIFA_SWAGGER_CONTEXT}`
    );

    appLogger.warn(
      `Swagger JSON download: ${config.get(
        "DOMIFA_BACKEND_URL"
      )}${DOMIFA_SWAGGER_CONTEXT}-json`
    );
    const options = new DocumentBuilder()
      .setTitle("Domifa")
      .setDescription("API description")
      .setVersion("1.0")
      // .addTag("xxx")
      .addBearerAuth({
        type: "http",
        scheme: "basic",
      })
      .build();

    const document = SwaggerModule.createDocument(app, options);
    const swaggerOptions: SwaggerCustomOptions = {};
    SwaggerModule.setup(DOMIFA_SWAGGER_CONTEXT, app, document, swaggerOptions);
  }
}

