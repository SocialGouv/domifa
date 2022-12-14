import { UsagerEntretienTable } from "./../../entities/usager/UsagerEntretienTable.typeorm";
import { UsagerEntretien } from "./../../../_common/model/usager/entretien/UsagerEntretien.type";

import { myDataSource } from "../_postgres";

export const usagerEntretienRepository =
  myDataSource.getRepository<UsagerEntretien>(UsagerEntretienTable);
