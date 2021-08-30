import { INestApplication, ValidationPipe } from "@nestjs/common";
import { NestFactory } from "@nestjs/core";
import {
  DocumentBuilder,
  SwaggerCustomOptions,
  SwaggerModule,
} from "@nestjs/swagger";

import * as compression from "compression";
import { Connection } from "typeorm";
import { AppModule } from "./app.module";
import { appHolder } from "./appHolder";
import { domifaConfig } from "./config";
import { appTypeormManager } from "./database";
import { appLogger } from "./util";
import { AppSentryInterceptor } from "./util/sentry";

export async function tearDownApplication({
  app,
  postgresTypeormConnection,
}: {
  app: INestApplication;
  postgresTypeormConnection: Connection;
}) {
  await app.close();
  await postgresTypeormConnection.close();
}

export async function bootstrapApplication() {
  try {
    if (domifaConfig().dev.sentry.enabled) {
      appLogger.debug(
        `SENTRY DNS enabled: ${domifaConfig().dev.sentry.sentryDsn}`
      );
    }

    const postgresTypeormConnection = await appTypeormManager.connect();

    const app = await NestFactory.create(AppModule);

    if (domifaConfig().dev.sentry.enabled) {
      app.useGlobalInterceptors(
        new AppSentryInterceptor() // remplace RavenInterceptor qui ne fonctionne plus
      );
    }

    appHolder.app = app;
    app.useGlobalPipes(new ValidationPipe());
    const corsUrl = domifaConfig().security.corsUrl;
    const enableCorsSecurity = !!corsUrl;
    if (enableCorsSecurity) {
      appLogger.warn(`Enable CORS from URL "${corsUrl}"`);
      app.enableCors({
        origin: corsUrl, // https://docs.nestjs.com/techniques/security#cors
      });
    } else {
      if (["dev", "test"].includes(domifaConfig().envId)) {
        app.enableCors({
          origin: true, // "Access-Control-Allow-Origin" = request.origin (unsecure): https://docs.nestjs.com/techniques/security#cors
        });
      } else {
        appLogger.error(`Disable CORS: configure "DOMIFA_CORS_URL" to enable.`);
      }
    }

    app.use(compression());
    configureSwagger(app);

    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
      })
    );

    return { app, postgresTypeormConnection };
  } catch (err) {
    // tslint:disable-next-line: no-console
    console.error("[bootstrapApplication] Error bootstraping application", err);
    appLogger.error("[bootstrapApplication] Error bootstraping application", {
      error: err as Error,
      sentry: true,
    });
    throw err;
  }
}

function configureSwagger(app) {
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
