import { StructureType } from "../structure/StructureType.type";
import { AppEntity } from "../_core/AppEntity.type";
import { StructureStatsQuestions } from "./StructureStatsQuestions.type";

export type StructureStats = AppEntity & {
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
  generated: boolean;
};
