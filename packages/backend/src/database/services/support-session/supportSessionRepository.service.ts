import { SupportSessionTable } from "../../entities/support-session";
import { myDataSource } from "../_postgres";

export const supportSessionRepository =
  myDataSource.getRepository(SupportSessionTable);
