import { Connection } from "mongoose";
import { StatsSchema } from "./stats.schema";

export const StatsProviders = [
  {
    inject: ["DATABASE_CONNECTION"],
    provide: "STATS_MODEL",
    useFactory: (connection: Connection) =>
      connection.model("Stats", StatsSchema)
  }
];
