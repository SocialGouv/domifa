import { PostgresConnectionOptions } from "typeorm/driver/postgres/PostgresConnectionOptions";
import { domifaConfig } from "../../../config";
import { appLogger, CustomTypeOrmLogger } from "../../../util";

const isTypescriptMode = __filename.split(".").pop() === "ts"; // if current file extension is "ts": use src/*.ts files, eles use dist/*.js files

let connectOptionsPaths: Pick<
  PostgresConnectionOptions,
  "migrations" | "entities" | "subscribers"
>;

if (isTypescriptMode) {
  appLogger.warn("[appTypeormManager] Running in typescript DEV mode");
  connectOptionsPaths = {
    migrations: ["src/_migrations/**/*.ts"],
    entities: ["src/database/entities/**/*Table.typeorm.ts"],
    subscribers: ["src/database/entities/**/*Subscriber.typeorm.ts"],
  };
} else {
  appLogger.warn("[appTypeormManager] Running in javascript DIST mode");
  connectOptionsPaths = {
    migrations: ["/app/packages/backend/dist/_migrations/**/*.js"],
    entities: [
      "/app/packages/backend/dist/database/entities/**/*Table.typeorm.js",
    ],
    subscribers: [
      "/app/packages/backend/dist/database/entities/**/*Subscriber.typeorm.js",
    ],
  };
}

export const PG_CONNECT_OPTIONS: PostgresConnectionOptions = {
  applicationName: "domifa-api",
  poolErrorHandler: (err: Error) => {
    appLogger.error("PG pool error:", { error: err, sentry: true });
  },
  type: "postgres",
  synchronize: false,
  migrationsTransactionMode: "none",
  migrationsRun:
    (domifaConfig().envId !== "test" && domifaConfig().cron.enable) ||
    domifaConfig().envId === "local",
  host: domifaConfig().postgres.host,
  port: domifaConfig().postgres.port,
  username: domifaConfig().postgres.username,
  password: domifaConfig().postgres.password,
  database: domifaConfig().postgres.database,
  // En test on garde un pool minimal, mais > 1 : certains flows (ex.
  // OtpService) ouvrent une transaction pour poser un pg_advisory_xact_lock
  // puis exécutent d'autres requêtes via les repositories module-level
  // (qui rentrent par la pool, pas par l'EntityManager de la transaction).
  // Avec poolSize=1 ce schéma deadlock car la transaction tient l'unique
  // connexion. En prod (poolSize=100) c'est invisible.
  poolSize: domifaConfig().envId === "test" ? 10 : 100,
  ssl: domifaConfig().postgres.ssl
    ? {
        rejectUnauthorized: false,
      }
    : false,
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
