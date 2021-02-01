import { StructureAdmin } from "../structure/StructureAdmin.type";

export type DashboardStats = {
  usersCount: number;
  usagersDocumentsCount: number;
  structures: (StructureAdmin & {
    usersCount?: number; // dashboard only
  })[];
  structuresCountByRegion: {
    region: string;
    count: number;
  }[];
  structuresCountByTypeMap: {
    [type: string]: number;
  };
  interactionsCountByTypeMap: {
    [statut: string]: number;
  };
  usagersCountByStatutMap: {
    [statut: string]: number;
  };
  usagersValidCountByStructureMap: {
    [structureId: string]: number;
  };
  usagersCountByLanguage: {
    langue: string;
    count: number;
  }[];
};
