import {
  TmpHistorique,
  TmpHistoriqueTable,
} from "../../entities/interaction/TmpHistoriqueTable.typeorm";
import {
  TmpCourriers,
  TmpCourriersTable,
} from "../../entities/interaction/TmpCourriersTable.typeorm";
import { myDataSource } from "../_postgres";

export const tmpHistoriqueRepository =
  myDataSource.getRepository<TmpHistorique>(TmpHistoriqueTable);

export const tmpCourriersRepository =
  myDataSource.getRepository<TmpCourriers>(TmpCourriersTable);
