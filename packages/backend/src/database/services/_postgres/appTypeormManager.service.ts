import {
  Connection,
  createConnection,
  EntityManager,
  EntityTarget,
  Migration
} from "typeorm";
import { PostgresConnectionOptions } from "typeorm/driver/postgres/PostgresConnectionOptions";
import { domifaConfig } from "../../../config";
import { appLogger } from "../../../util";

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

async function connect(
  { reuseConnexion }: { reuseConnexion: boolean } = { reuseConnexion: false }
) {
  const pgConfig = domifaConfig().postgres;
  if (reuseConnexion && connectionHolder.connection) {
    appLogger.warn(
      `[appTypeormManager] Reuse postgres database connection to "${pgConfig.database}" at ${pgConfig.host}:${pgConfig.port}`
    );
    return connectionHolder.connection;
  }

  appLogger.warn(
    `[appTypeormManager] Connecting to postgres database "${pgConfig.database}" at ${pgConfig.host}:${pgConfig.port}`
  );

  const isTypescriptMode = __filename.split(".").pop() === "ts"; // if current file extension is "ts": use src/*.ts files, eles use dist/*.js files

  let connectOptionsPaths: Pick<
    PostgresConnectionOptions,
    "migrations" | "entities" | "subscribers"
  >;

  if (isTypescriptMode) {
    appLogger.warn(`[appTypeormManager] Running in typescript DEV mode`);
    connectOptionsPaths = {
      migrations: domifaConfig().typeorm.createDatabase?[
        `src/_migrations/**/*.ts`,
      ]:[
        `src/_migrations/**/*.ts`,
        `src/_migrations_exclude-from-create_db/**/*.ts`
      ],
      entities: ["src/database/entities/**/*Table.typeorm.ts"],
      subscribers: ["src/**/*Subscriber.typeorm.ts"],
    };
  } else {
    appLogger.warn(`[appTypeormManager] Running in javascript DIST mode`);
    connectOptionsPaths = {
      migrations: domifaConfig().typeorm.createDatabase?[
        `dist/_migrations/**/*.js`
      ]:[
        `dist/_migrations/**/*.js`,
        `dist/_migrations_exclude-from-create_db/**/*.js`
      ],
      entities: ["dist/database/entities/**/*Table.typeorm.js"],
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
    logging: pgConfig.logging,
    ...connectOptionsPaths,
  };
  try {
    connectionHolder.connection = await createConnection(connectOptions);
    appLogger.debug(`[appTypeormManager] postgres connection success`);
    return connectionHolder.connection;
  } catch (err) {
    console.error("[appTypeormManager] err:", err);
    appLogger.warn(
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
