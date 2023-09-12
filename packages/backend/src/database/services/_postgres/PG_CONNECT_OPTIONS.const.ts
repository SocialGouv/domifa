import { PostgresConnectionOptions } from "typeorm/driver/postgres/PostgresConnectionOptions";
import { domifaConfig } from "../../../config";
import { appLogger } from "../../../util";
import { CustomTypeOrmLogger } from "../../../util/CustomTypeOrmLogger";

const isTypescriptMode = __filename.split(".").pop() === "ts"; // if current file extension is "ts": use src/*.ts files, eles use dist/*.js files

let connectOptionsPaths: Pick<
  PostgresConnectionOptions,
  "migrations" | "entities" | "subscribers"
>;

if (isTypescriptMode) {
  if (domifaConfig().envId !== "test") {
    appLogger.warn(`[appTypeormManager] Running in typescript DEV mode`);
  }
  connectOptionsPaths = {
    migrations: domifaConfig().typeorm.createDatabase
      ? [`src/_migrations/**/*.ts`]
      : [
          `src/_migrations/**/*.ts`,
          `src/_migrations_exclude-from-create_db/**/*.ts`,
        ],
    entities: ["src/database/entities/**/*Table.typeorm.ts"],
    subscribers: ["src/**/*Subscriber.typeorm.ts"],
  };
} else {
  if (domifaConfig().envId !== "test") {
    appLogger.warn(`[appTypeormManager] Running in javascript DIST mode`);
  }
  connectOptionsPaths = {
    migrations: domifaConfig().typeorm.createDatabase
      ? [`dist/_migrations/**/*.js`]
      : [
          `dist/_migrations/**/*.js`,
          `dist/_migrations_exclude-from-create_db/**/*.js`,
        ],
    entities: ["dist/database/entities/**/*Table.typeorm.js"],
    subscribers: ["dist/**/*Subscriber.typeorm.js"],
  };
}

export const PG_CONNECT_OPTIONS: PostgresConnectionOptions = {
  applicationName: "domifa-api",
  poolErrorHandler: (err: Error) => {
    appLogger.error("PG pool error:", { error: err, sentry: true });
  },
  type: "postgres",
  synchronize: false,
  migrationsTransactionMode: "each",
  migrationsRun: true,
  host: domifaConfig().postgres.host,
  port: domifaConfig().postgres.port,
  username: domifaConfig().postgres.username,
  password: domifaConfig().postgres.password,
  database: domifaConfig().postgres.database,
  logger: new CustomTypeOrmLogger(
    domifaConfig().envId !== "test"
      ? domifaConfig().logger.logSqlRequests
        ? "all"
        : ["error", "warn", "info"]
      : false
  ),
  ...connectOptionsPaths,
  maxQueryExecutionTime: 1000,
};
