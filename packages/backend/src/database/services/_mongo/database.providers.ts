import * as mongoose from "mongoose";
import { domifaConfig } from "../../../config";

mongoose.set("debug", domifaConfig().mongo.debug);

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
  const { host, pass, port, user, name, authSource } = domifaConfig().mongo;
  // console.log("!!! CONFIG !!!", host, pass, port, user, name, authSource);
  return `mongodb://${user}:${pass}@${host}:${port}/${name}${
    authSource ? `?authSource=${authSource}` : ""
  }`;
}
