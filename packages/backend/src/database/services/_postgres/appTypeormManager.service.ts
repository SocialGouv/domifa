import { PG_CONNECT_OPTIONS } from "./PG_CONNECT_OPTIONS.const";
import { DataSource, EntityTarget, Migration } from "typeorm";
import { domifaConfig, DomifaConfigPostgres } from "../../../config";
import { isCronEnabled } from "../../../config/services/isCronEnabled.service";
import { appLogger } from "../../../util";

export const appTypeormManager = {
  connect,
  getRepository,
  getConnection,
  migrateUp,
  migrateDown,
};

export const myDataSource: DataSource = new DataSource(PG_CONNECT_OPTIONS);

async function migrateUp(connection: DataSource): Promise<Migration[]> {
  if (domifaConfig().envId !== "local") {
    if (!isCronEnabled()) {
      console.log("[MIGRATIONS] Disable in this pod");
      return [];
    }
  }

  const migrations = await connection.runMigrations({
    transaction: "each",
  });
  appLogger.warn(`Migration success: ${migrations.length}`);
  return migrations;
}

async function migrateDown(
  connection: DataSource,
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

function getRepository<Entity>(entityTarget: EntityTarget<Entity>) {
  return myDataSource.getRepository(entityTarget);
}

function getConnection(): DataSource {
  return myDataSource;
}
