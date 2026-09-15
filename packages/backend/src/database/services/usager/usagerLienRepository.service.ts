import { UsagerLien, UsagerLienSuggestionRejetee } from "@domifa/common";
import { UsagerLienTable } from "../../entities/usager/UsagerLienTable.typeorm";
import { UsagerLienSuggestionRejeteeTable } from "../../entities/usager/UsagerLienSuggestionRejeteeTable.typeorm";
import { myDataSource } from "../_postgres";

export const usagerLienRepository =
  myDataSource.getRepository<UsagerLien>(UsagerLienTable);

export const usagerLienSuggestionRejeteeRepository =
  myDataSource.getRepository<UsagerLienSuggestionRejetee>(
    UsagerLienSuggestionRejeteeTable
  );
