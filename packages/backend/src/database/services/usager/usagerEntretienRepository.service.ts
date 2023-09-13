import { UsagerEntretienTable } from "./../../entities/usager/UsagerEntretienTable.typeorm";

import { myDataSource } from "../_postgres";
import { UsagerEntretien } from "@domifa/common";

export const usagerEntretienRepository =
  myDataSource.getRepository<UsagerEntretien>(UsagerEntretienTable);
