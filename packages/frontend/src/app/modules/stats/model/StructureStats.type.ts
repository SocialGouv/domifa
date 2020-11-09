import { StructureStatsQuestions } from ".";
import { AppEntity } from "../../shared/model";
import { StructureType } from "./StructureType.type";

export type StructureStats = AppEntity & {
  //  public _id: ObjectID;
  /**
   * @deprecated obsolete mongo id: use `uuid` instead.
   */
  _id?: any;
  createdAt?: Date;
  date: Date;
  nom: string;
  structureId: number;
  structureType: StructureType;
  departement: string;
  ville: string;
  capacite: number;
  codePostal: string;
  questions: StructureStatsQuestions;
};
