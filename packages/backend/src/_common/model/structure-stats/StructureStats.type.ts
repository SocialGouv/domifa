import { StructureType } from "../structure/StructureType.type";
import { AppEntity } from "../_core/AppEntity.type";

export type StructureStats = AppEntity & {
  date: Date;
  nom: string;
  structureId: number;
  structureType: StructureType;
  departement: string;
  ville: string;
  capacite: number;
  codePostal: string;
  questions: any;
  generated: boolean;
};
