import { StatsByRegion } from ".";
import { StructureAdmin } from "../structure/StructureAdmin.type";

export type DashboardStats = {
  usersCount: number;
  usagersDocumentsCount: number;
  structures: (StructureAdmin & {
    usersCount?: number; // dashboard only
  })[];
  structuresCountByRegion: StatsByRegion;
  structuresCountByTypeMap: {
    [type: string]: number;
  };
  structuresCountBySmsEnabled: number;
  interactionsCountByTypeMap: {
    [statut: string]: number;
  };
  usagersCountByStatutMap: {
    [statut: string]: number;
  };
  usagersAyantsDroitsCountByStructureMap: {
    [structureId: string]: number;
  };
  usagersValidCountByStructureMap: {
    [structureId: string]: number;
  };
  usagersAllCountByStructureMap: {
    [structureId: string]: number;
  };
  usagersCountByLanguage: {
    langue: string;
    count: number;
  }[];
};
