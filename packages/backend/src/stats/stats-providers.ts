import { Connection } from "mongoose";
import { StatsDocument } from "./stats.interface";
import { StatsSchema } from "./stats.schema";

export const StatsProviders = [
  {
    inject: ["DATABASE_CONNECTION"],
    provide: "STATS_MODEL",
    useFactory: (connection: Connection) =>
      connection.model<StatsDocument>("Stats", StatsSchema),
  },
];
