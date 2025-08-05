import { UserUsagerSecurityTable } from "../../entities/user-usager/UserUsagerSecurityTable.typeorm";
import { myDataSource } from "../_postgres";

export const userUsagerSecurityRepository = myDataSource.getRepository(
  UserUsagerSecurityTable
);
