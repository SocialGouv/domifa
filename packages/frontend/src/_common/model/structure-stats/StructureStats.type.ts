import { AppEntity, StructureType } from "@domifa/common";

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
