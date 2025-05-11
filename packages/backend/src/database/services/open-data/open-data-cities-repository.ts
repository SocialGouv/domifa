import { OpenDataCity } from "../../../modules/open-data/interfaces";
import { OpenDataCitiesTable } from "../../entities/open-data";
import { myDataSource } from "../_postgres";

export const openDataCitiesRepository =
  myDataSource.getRepository<OpenDataCity>(OpenDataCitiesTable);
