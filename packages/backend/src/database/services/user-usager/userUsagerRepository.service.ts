import { UserUsagerTable } from "../../entities";
import { myDataSource } from "../_postgres";

export const userUsagerRepository = myDataSource.getRepository(UserUsagerTable);
