import { PG_CONNECT_OPTIONS } from "./PG_CONNECT_OPTIONS.const";
import { DataSource, Migration } from "typeorm";
import { domifaConfig, DomifaConfigPostgres } from "../../../config";
import { isCronEnabled } from "../../../config/services/isCronEnabled.service";
import { appLogger } from "../../../util";

export const appTypeormManager = {
  connect,
  migrateUp,
  migrateDown,
};

export const myDataSource: DataSource = new DataSource(PG_CONNECT_OPTIONS);

async function migrateUp(connection: DataSource): Promise<Migration[]> {
  if (!isCronEnabled()) {
    return [];
  }
  appLogger.warn(`\nStart migrations ....`);

  const migrations = await connection.runMigrations({
    transaction: "each",
  });

  appLogger.warn(`\nMigration success: ${migrations.length}\n`);
  return migrations;
}

async function migrateDown(
  connection: DataSource,
  downMaxCount?: number
): Promise<void> {
  const count = downMaxCount || connection.migrations.length;

  appLogger.warn(`REVERT ${count} migrations`);

  const migrations = connection.migrations.slice(0, count);

  for (const migration of migrations) {
    await revertLastMigration(connection);
    appLogger.warn(`Migration "${migration.name}" reverted`);
  }
}

async function revertLastMigration(connection: DataSource): Promise<void> {
  await connection.undoLastMigration({
    transaction: "all",
  });
}

async function connect(
  {
    reuseConnexion,
    overrideConfig = {},
  }: {
    reuseConnexion: boolean;
    overrideConfig?: Partial<DomifaConfigPostgres>;
  } = { reuseConnexion: true }
) {
  const pgConfig = { ...domifaConfig().postgres, ...overrideConfig };

  if (reuseConnexion && myDataSource && myDataSource?.isInitialized) {
    appLogger.warn(
      `[appTypeormManager] Reuse postgres database connection to "${pgConfig.database}" at ${pgConfig.host}:${pgConfig.port}`
    );
    return myDataSource;
  }

  if (domifaConfig().envId !== "test") {
    appLogger.warn(
      `[appTypeormManager] Connecting to postgres database "${pgConfig.database}" at ${pgConfig.host}:${pgConfig.port} (max poolMaxConnections=${pgConfig.poolMaxConnections}, logging="${pgConfig.logging}")`
    );
  }

  try {
    await myDataSource.initialize();
    return myDataSource;
  } catch (err) {
    appLogger.warn(
      `[appTypeormManager] Error connecting to postgres with options: ${JSON.stringify(
        PG_CONNECT_OPTIONS
      )}`
    );
    appLogger.error("Error connecting to postgres");
    throw err;
  }
}
