import { INestApplication, ValidationPipe } from "@nestjs/common";
import { NestFactory } from "@nestjs/core";
import {
  DocumentBuilder,
  SwaggerCustomOptions,
  SwaggerModule
} from "@nestjs/swagger";
import * as Sentry from "@sentry/node";
import * as compression from "compression";
import { Connection } from "typeorm";
import { AppModule } from "./app.module";
import { appHolder } from "./appHolder";
import { configService } from "./config/config.service";
import { appTypeormManager } from "./database/appTypeormManager.service";
import { REGIONS_DEF } from "./structures/REGIONS_DEF.const";
import { appLogger } from "./util";

console.log("xxx REGIONS_DEF:", JSON.stringify(REGIONS_DEF));

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
    configService.loadConfig();

    Sentry.init({
      dsn: process.env.SENTRY_DSN,
      release: "domifa@" + process.env.npm_package_version,
      serverName: configService.getEnvId(),
    });

    const postgresTypeormConnection = await appTypeormManager.connect();

    const app = await NestFactory.create(AppModule);
    appHolder.app = app;
    app.useGlobalPipes(new ValidationPipe());
    const corsUrl = configService.get("DOMIFA_CORS_URL");
    const enableCorsSecurity = corsUrl && corsUrl.trim().length !== 0;
    if (enableCorsSecurity) {
      appLogger.warn(`Enable CORS from URL "${corsUrl}"`);
      app.enableCors({
        origin: corsUrl, // https://docs.nestjs.com/techniques/security#cors
      });
    } else {
      if (["dev", "test"].includes(configService.getEnvId())) {
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
    throw err;
  }
}

function configureSwagger(app) {
  const DOMIFA_SWAGGER_CONTEXT = "sw-api";
  if (configService.getBoolean("DOMIFA_SWAGGER_ENABLE")) {
    // enable swagger ui http://localhost:3000/api-json & http://localhost:3000/${DOMIFA_SWAGGER_CONTEXT}
    appLogger.warn(
      `Swagger UI enabled: ${configService.get(
        "DOMIFA_BACKEND_URL"
      )}${DOMIFA_SWAGGER_CONTEXT}`
    );

    appLogger.warn(
      `Swagger JSON download: ${configService.get(
        "DOMIFA_BACKEND_URL"
      )}${DOMIFA_SWAGGER_CONTEXT}-json`
    );
    const options = new DocumentBuilder()
      .setTitle("Domifa")
      .setDescription("API description")
      .setVersion("1.0")
      // .addTag("xxx")
      // NOTE: possibilité de définir différents token sur l'interface:
      // .addBearerAuth({ in: "header", type: "http" }, "responsable")
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
