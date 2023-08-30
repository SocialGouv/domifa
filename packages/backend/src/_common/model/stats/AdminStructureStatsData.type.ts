import { InteractionType } from "./../interaction/InteractionType.type";
export type AdminStructureStatsData = {
  usersCount: number;
  structuresCount: number;
  usagersDocumentsCount: number;
  // structures: StructureAdminForList[];
  structuresCountByRegion: {
    region: string;
    count: number;
  }[];
  structuresCountByTypeMap: {
    [type: string]: number;
  };
  structuresCountBySmsEnabled: number;
  interactionsCountByTypeMap: {
    [statut in InteractionType]: number;
  };
  usagersCountByStatutMap: {
    [statut: string]: number;
  };
  usagersValidCountByStructureMap: {
    [structureId: string]: number;
  };
  usagersAllCountByStructureMap: {
    [structureId: string]: number;
  };
  usagersAyantsDroitsCountByStructureMap: {
    [structureId: string]: number;
  };
};
