import * as mongoose from "mongoose";
import { configService } from "../config/config.service";

mongoose.set("debug", configService.getBoolean("DOMIFA_MONGOOSE_DEBUG"));

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
  const user = configService.get("DB_USER");
  const password = configService.get("DB_PASS");
  const host = configService.get("DB_HOST");
  const port = configService.get("DB_PORT");
  const dbAuthSource = configService.get("DB_AUTH_SOURCE");
  const dbName = configService.get("DB_NAME");

  const debug = configService.get("DOMIFA_MONGOOSE_DEBUG");

  return `mongodb://${user}:${password}@${host}:${port}/${dbName}${
    dbAuthSource ? `?authSource=${dbAuthSource}` : ""
  }`;
}
