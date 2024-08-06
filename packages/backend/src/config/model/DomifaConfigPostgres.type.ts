export type DomifaConfigPostgres = {
  host: string; // POSTGRES_HOST
  port: number; // POSTGRES_PORT
  username: string; // POSTGRES_USERNAME
  password: string; // POSTGRES_PASSWORD
  database: string; // POSTGRES_DATABASE
  ssl: boolean; // POSTGRES_SSL
};
