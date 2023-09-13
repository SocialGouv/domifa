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
  appLogger.warn(`[appTypeormManager] Running in typescript DEV mode`);
  connectOptionsPaths = {
    migrations: [`src/_migrations/**/*.ts`],
    entities: ["src/database/entities/**/*Table.typeorm.ts"],
  };
} else {
  appLogger.warn(`[appTypeormManager] Running in javascript DIST mode`);
  connectOptionsPaths = {
    migrations: [`dist/_migrations/**/*.js`],
    entities: ["dist/database/entities/**/*Table.typeorm.js"],
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
  migrationsRun: domifaConfig().envId !== "test",
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
