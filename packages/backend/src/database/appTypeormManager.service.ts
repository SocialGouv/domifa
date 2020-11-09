import {
  Connection,
  createConnection,
  EntityManager,
  EntityTarget,
  Migration,
} from "typeorm";
import { PostgresConnectionOptions } from "typeorm/driver/postgres/PostgresConnectionOptions";
import { configService } from "../config";
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

  console.log(pgConfig);
>>>>>>> draft(interactions): migration du modele
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
    logging: ["warn"],
    ...connectOptionsPaths,
  };

  console.log(connectOptions);
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
