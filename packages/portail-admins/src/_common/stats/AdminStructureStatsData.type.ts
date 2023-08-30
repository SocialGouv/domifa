import { InteractionType } from "../interaction/InteractionType.type";
import { StructureAdmin } from "../structure/StructureAdmin.type";
import { StructureType } from "../structure/StructureType.type";
import { UsagerDecisionStatut } from "../usager/UsagerDecisionStatut.type";
import { StatsByRegion } from "./StatsByRegion.type";

export type AdminStructureStatsData = {
  usersCount: number;
  structuresCount: number;
  usagersDocumentsCount: number;
  structures: (StructureAdmin & {
    usersCount?: number; // dashboard only
  })[];
  structuresCountByRegion: StatsByRegion;
  structuresCountByTypeMap: {
    [type in StructureType | "total"]: number;
  };
  structuresCountBySmsEnabled: number;
  interactionsCountByTypeMap: {
    [type in InteractionType]: number;
  };
  usagersCountByStatutMap: {
    [statut in UsagerDecisionStatut | "TOUS"]: number;
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
};
