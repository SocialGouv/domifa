import { LoggerOptions } from "typeorm/logger/LoggerOptions";

export type DomifaConfigPostgres = {
  host: string; // POSTGRES_HOST
  port: number; // POSTGRES_PORT
  username: string; // POSTGRES_USERNAME
  password: string; // POSTGRES_PASSWORD
  database: string; // POSTGRES_DATABASE
  logging: LoggerOptions; // POSTGRES_LOGGING
  poolMaxConnections: number; // POSTGRES_POOL_MAX_CONNEXIONS
};
