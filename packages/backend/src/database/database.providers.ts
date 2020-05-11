import * as mongoose from "mongoose";
import { ConfigService } from "../config/config.service";

const config = new ConfigService();
const user = config.get("DB_USER");
const password = config.get("DB_PASS");
const host = config.get("DB_HOST");
const port = config.get("DB_PORT");

mongoose.set("debug", config.get("IS_LOCAL") !== undefined);

export const databaseProviders = [
  {
    provide: "DATABASE_CONNECTION",
    useFactory: async (): Promise<typeof mongoose> =>
      mongoose.connect(`mongodb://${user}:${password}@${host}:${port}/domifa`, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
        useFindAndModify: false,
        useCreateIndex: true,
      }),
  },
];
