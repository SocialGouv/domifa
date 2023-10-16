import {
  Historique,
  HistoriqueTable,
} from "../../entities/interaction/HistoriqueTable.typeorm";
import { myDataSource } from "../_postgres";

export const historiqueRepository =
  myDataSource.getRepository<Historique>(HistoriqueTable);
