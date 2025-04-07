import { myDataSource } from "../_postgres";
import { UserSupervisorTable } from "../../entities/user-supervisor";

export const userSupervisorRepository =
  myDataSource.getRepository(UserSupervisorTable);
