import moment = require("moment");
import {
  Connection,
  createConnection,
  EntityManager,
  EntityTarget,
  Migration,
} from "typeorm";
import { PostgresConnectionOptions } from "typeorm/driver/postgres/PostgresConnectionOptions";
import { LoggerOptions } from "typeorm/logger/LoggerOptions";
import { configService, DomifaConfigKey } from "../config";
import { appLogger } from "../util";

export const appTypeormManager = {
  connect,
  getRepository,
  getConnection,
  migrateUp,
  migrateDown,
};

const connectionHolder: {
  connection: Connection;
} = {
  connection: undefined,
};

async function migrateUp(connection: Connection): Promise<Migration[]> {
  const migrations = await connection.runMigrations({
    transaction: "all",
  });
  appLogger.warn(`Migration success: ${migrations.length}`);
  return migrations;
}
async function migrateDown(
  connection: Connection,
  downMaxCount?: number
): Promise<void> {
  const count = downMaxCount ? downMaxCount : connection.migrations.length;

  appLogger.warn(`REVERT ${count} migrations`);

  const migrations = connection.migrations.slice(0, count);

  for (const migration of migrations) {
    await revertLastMigration(connection);
    appLogger.warn(`Migration "${migration.name}" reverted`);
  }
}

async function revertLastMigration(connection: Connection): Promise<void> {
  await connection.undoLastMigration({
    transaction: "all",
  });
}

async function connect() {
  const pgConfig = {
    host: configService.get("POSTGRES_HOST"),
    port: configService.getInteger("POSTGRES_PORT"),
    username: configService.get("POSTGRES_USERNAME"),
    password: configService.get("POSTGRES_PASSWORD"),
    database: configService.get("POSTGRES_DATABASE"),
  };
  appLogger.warn(
    `[appTypeormManager] Connecting to postgres database "${pgConfig.database}" at ${pgConfig.host}:${pgConfig.port}`
  );

  const isTypescriptMode = __filename.split(".").pop() === "ts"; // if current file extension is "ts": use src/*.ts files, eles use dist/*.js files

  let connectOptionsPaths: Pick<
    PostgresConnectionOptions,
    "migrations" | "entities" | "subscribers"
  >;

  if (isTypescriptMode) {
    appLogger.warn(
      `[appTypeormManager] TS_NODE_DEV detected: running in typescript DEV mode`
    );
    connectOptionsPaths = {
      migrations: ["src/_migrations/**/*.ts"],
      entities: ["src/**/pg/*Table.typeorm.ts"],
      subscribers: ["src/**/*Subscriber.typeorm.ts"],
    };
  } else {
    appLogger.warn(
      `[appTypeormManager] TS_NODE_DEV NOT detected: running in javascript DIST mode`
    );
    connectOptionsPaths = {
      migrations: ["dist/_migrations/**/*.js"],
      entities: ["dist/**/pg/*Table.typeorm.js"],
      subscribers: ["dist/**/*Subscriber.typeorm.js"],
    };
  }
  const connectOptions: PostgresConnectionOptions = {
    type: "postgres",
    host: pgConfig.host,
    port: pgConfig.port,
    username: pgConfig.username,
    password: pgConfig.password,
    database: pgConfig.database,
    logger: "simple-console",
    logging: getLoggerOptions("POSTGRES_LOGGING"),
    ...connectOptionsPaths,
  };
  try {
    connectionHolder.connection = await createConnection(connectOptions);
    return connectionHolder.connection;
  } catch (err) {
    appLogger.debug(
      `[appTypeormManager] Error connecting to postgres with options: ${JSON.stringify(
        connectOptions
      )}`
    );
    appLogger.error("Error connecting to postgres");
    throw err;
  }
}
function getRepository<Entity>(
  entityTarget: EntityTarget<Entity>,
  entityManager?: EntityManager
) {
  return _getEntityManager(entityManager).getRepository(entityTarget);
}
function _getEntityManager(entityManager?: EntityManager) {
  return entityManager ? entityManager : getConnection().manager;
}
function getConnection(): Connection {
  return connectionHolder.connection;
}
type LoggerOptionValues =
  | "query"
  | "schema"
  | "error"
  | "warn"
  | "info"
  | "log"
  | "migration"; // @see typeorm LoggerOption
const LOGGER_OPTIONS: LoggerOptionValues[] = [
  "query",
  "schema",
  "error",
  "warn",
  "info",
  "log",
  "migration",
];
function getLoggerOptions(key: DomifaConfigKey): LoggerOptions {
  const value = configService.get(key);
  if (value) {
    if (value.trim() === "all") {
      return "all";
    }
    if (value.trim() === "true") {
      return true;
    }
    if (value.trim() === "false") {
      return false;
    }
    const values = value
      .split(",")
      .map((x) => x.trim())
      .reduce((acc, x) => {
        if (x) {
          if (LOGGER_OPTIONS.includes(x as LoggerOptionValues)) {
            acc.push(x as LoggerOptionValues);
          } else {
            appLogger.warn(
              `[appTypeormManager] Invalid typeorm logger option "${x}", @see LoggerOptions`
            );
          }
        }
        return acc;
      }, [] as LoggerOptionValues[]);
    return values;
  }
  return ["warn"]; // default
}
