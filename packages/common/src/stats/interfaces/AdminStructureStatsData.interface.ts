import { type InteractionType } from "../../interactions";

export interface AdminStructureStatsData {
  usersCount: number;
  structuresCount: number;
  usagersDocumentsCount: number;
  usagersActifs: {
    domicilies: number;
    ayantsDroits: number;
    actifs: number;
  };
  structuresCountByRegion: Array<{
    region: string;
    count: number;
  }>;
  structuresCountByTypeMap: Record<string, number>;
  structuresCountBySmsEnabled: number;
  interactionsCountByTypeMap: {
    [statut in InteractionType]: number;
  };
  usagersCountByStatutMap: Record<string, number>;
  usagersValidCountByStructureMap: Record<string, number>;
  usagersAllCountByStructureMap: Record<string, number>;
  usagersAyantsDroitsCountByStructureMap: Record<string, number>;
}
