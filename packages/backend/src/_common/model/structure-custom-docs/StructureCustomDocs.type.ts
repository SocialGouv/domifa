import { AppEntity } from "../_core/AppEntity.type";

export type StructureCustomDocs = AppEntity & {
  createdAt?: Date;
  createdBy: string;
  nom: string;
  structureId: number;
  labels: string[];
  status: string[];
  capacite: number;
};
