import * as mongoose from "mongoose";
import { ConfigService } from "../config/config.service";

mongoose.set("useFindAndModify", false);
mongoose.set("useCreateIndex", true);
//mongoose.set("debug", true);

const config = new ConfigService();
const user = config.get("DB_USER");
const password = config.get("DB_PASS");
const host = config.get("DB_HOST");
const port = config.get("DB_PORT");

export const databaseProviders = [
  {
    provide: "DATABASE_CONNECTION",
    useFactory: async (): Promise<typeof mongoose> =>
      mongoose.connect(
        "mongodb://" +
          user +
          ":" +
          password +
          "@" +
          host +
          ":" +
          port +
          "/domifa",
        {
          useNewUrlParser: true,
          useUnifiedTopology: true
        }
      )
  }
];
