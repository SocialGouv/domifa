import { PostgresConnectionOptions } from "typeorm/driver/postgres/PostgresConnectionOptions";
import { domifaConfig } from "../../../config";
import { appLogger } from "../../../util";
import { CustomTypeOrmLogger } from "../../../util/CustomTypeOrmLogger";

export const PG_CONNECT_OPTIONS: PostgresConnectionOptions = {
  applicationName: "domifa-api",
  poolErrorHandler: (err: Error) => {
    appLogger.error("PG pool error:", { error: err, sentry: true });
  },
  type: "postgres",
  synchronize: true,
  migrationsRun: false, // don't auto-run migrations
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
  migrations: domifaConfig().typeorm.createDatabase
    ? [`src/_migrations/**/*{.ts,.js}`]
    : [
        `src/_migrations/**/*{.ts,.js}`,
        `src/_migrations_exclude-from-create_db/**/*{.ts,.js}`,
      ],
  entities: ["src/database/entities/**/*Table.typeorm{.ts,.js}"],
  maxQueryExecutionTime: 1000,
};
