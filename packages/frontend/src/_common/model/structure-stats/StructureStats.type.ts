import { StructureType } from "../structure/StructureType.type";
import { AppEntity } from "../_core/AppEntity.type";

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
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  questions: any;
  generated: boolean;
};
