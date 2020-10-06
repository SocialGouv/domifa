import * as mongoose from "mongoose";
import { ConfigService } from "../config/config.service";

const config = new ConfigService();

mongoose.set("debug", config.getBoolean("DOMIFA_MONGOOSE_DEBUG"));

const mongoConnectionString = buildMongoConnectionStringFromEnv();

export const databaseProviders = [
  {
    provide: "DATABASE_CONNECTION",
    useFactory: async (): Promise<typeof mongoose> =>
      mongoose.connect(mongoConnectionString, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
        useFindAndModify: false,
        useCreateIndex: true,
      }),
  },
];

export function buildMongoConnectionStringFromEnv() {
  const user = config.get("DB_USER");
  const password = config.get("DB_PASS");
  const host = config.get("DB_HOST");
  const port = config.get("DB_PORT");
  const dbAuthSource = config.get("DB_AUTH_SOURCE");

  return `mongodb://${user}:${password}@${host}:${port}/domifa${
    dbAuthSource ? `?authSource=${dbAuthSource}` : ""
  }`;
}
