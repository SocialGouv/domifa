import { Connection } from "mongoose";
import { UsagerSchema } from "./usager.schema";

export const UsagersProviders = [
  {
    inject: ["DATABASE_CONNECTION"],
    provide: "USAGER_MODEL",
    useFactory: (connection: Connection) =>
      connection.model("Usager", UsagerSchema),
  },
];
