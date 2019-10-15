import * as mongoose from "mongoose";
import { ConfigService } from "../config/config.service";

mongoose.set("useFindAndModify", false);
mongoose.set("useCreateIndex", true);
// mongoose.set("debug", true);

const config = new ConfigService();
const user = config.get("DB_USER");
const password = config.get("DB_PASS");

export const databaseProviders = [
  {
    provide: "DATABASE_CONNECTION",
    useFactory: async (): Promise<typeof mongoose> =>
      mongoose.connect("mongodb://127.0.0.1:27017/domifa", {
        reconnectInterval: 1000,
        reconnectTries: Number.MAX_VALUE,
        useNewUrlParser: true,
        useUnifiedTopology: true
      })
  }
];
