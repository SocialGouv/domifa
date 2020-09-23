import * as Umzug from "umzug";
import { MongoClient } from "mongodb";
import { Logger } from "@nestjs/common";
import { buildMongoConnectionStringFromEnv } from "../database/database.providers";

export const umzugMigrationManager = {
  migrateUp,
  migrateDownLast,
};

async function migrateUp() {
  Logger.log(`[umzugMigrationManager.migrateUp] migration START`);

  const client = await createMongoClient();

  try {
    const umzug = configureUmzug(client);

    const migrations = await umzug.up();
    Logger.log(
      `[umzugMigrationManager.migrateUp] run ${migrations.length} migrations SUCCESS`
    );
  } catch (err) {
    Logger.error(`[umzugMigrationManager.migrateUp] connection error`, err);
    throw err;
  } finally {
    await client.close();
  }
}

async function migrateDownLast() {
  Logger.log(`[umzugMigrationManager.migrateDownLast] revert migration START`);

  const client = await createMongoClient();

  try {
    const umzug = configureUmzug(client);

    const migrations = await umzug.down();
    Logger.log(
      `[umzugMigrationManager.migrateDownLast] revert ${migrations.length} migration SUCCESS`
    );
  } catch (err) {
    Logger.error(
      `[umzugMigrationManager.migrateDownLast] connection error`,
      err
    );
    throw err;
  } finally {
    await client.close();
  }
}

async function createMongoClient() {
  const uri = buildMongoConnectionStringFromEnv();
  const client = new MongoClient(uri);

  try {
    await client.connect();
  } catch (err) {
    Logger.error(`[umzugMigrationManager] connection error`, err);
    throw err;
  }
  return client;
}

function configureUmzug(client: MongoClient) {
  const mongoDBStorageOptions: Partial<Umzug.MongoDBStorageOptions> = {
    // a connection to target database established with MongoDB Driver
    connection: client.db(),

    // name of migration collection in MongoDB
    collectionName: "_migrations",
  };

  const umzug = new Umzug({
    // The storage.
    // Possible values: 'none', 'json', 'mongodb', 'sequelize', an argument for `require()`, including absolute paths
    storage: "mongodb",

    // The options for the storage.
    // Check the available storages for further details.
    storageOptions: mongoDBStorageOptions,

    // The logging function.
    // A function that gets executed everytime migrations start and have ended.
    logging: false,

    // (advanced) you can pass an array of migrations built with `migrationsList()` instead of the options below
    migrations: {
      // The params that gets passed to the migrations.
      // Might be an array or a synchronous function which returns an array.
      params: [],

      // The path to the migrations directory.
      path: __dirname,

      // The pattern that determines whether or not a file is a migration.
      pattern: /^\d+[\w-]+\.migration\.ts$/,

      // A function that receives and returns the to be executed function.
      // This can be used to modify the function.
      wrap(fun) {
        return fun;
      },
    },
  });
  return umzug;
}
