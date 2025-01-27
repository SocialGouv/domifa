import { INestApplication, ValidationPipe } from "@nestjs/common";
import { NestFactory } from "@nestjs/core";
import {
  DocumentBuilder,
  SwaggerCustomOptions,
  SwaggerModule,
} from "@nestjs/swagger";

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
    setupLog(app);

    if (domifaConfig().dev.sentry.enabled) {
      app.useGlobalInterceptors(new AppSentryInterceptor());
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
        maxAge: 600,
      });
    }

    app.use(compression());
    app.getHttpAdapter().getInstance().disable("x-powered-by");

    configureSwagger(app);

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
