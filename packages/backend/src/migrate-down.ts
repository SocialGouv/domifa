import { ValidationPipe } from "@nestjs/common";
import { NestFactory } from "@nestjs/core";
import Sentry = require("@sentry/node");
import * as compression from "compression";
import { config } from "dotenv";
import { AppModule } from "./app.module";
import { umzugMigrationManager } from "./_migrations/umzug-migration-manager";

(async () => {
  await umzugMigrationManager.migrateDownLast();
})();
