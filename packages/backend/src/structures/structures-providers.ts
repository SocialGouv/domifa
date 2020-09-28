import { Connection } from "mongoose";
import { DepartementHelper } from "./departement-helper.service";
import { StructureSchema } from "./structure.schema";

export const StructuresProviders = [
  {
    inject: ["DATABASE_CONNECTION"],
    provide: "STRUCTURE_MODEL",
    useFactory: (connection: Connection) =>
      connection.model("Structure", StructureSchema),
  },
  DepartementHelper,
];
