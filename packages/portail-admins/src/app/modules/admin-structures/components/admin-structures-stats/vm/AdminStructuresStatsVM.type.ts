import {
  InteractionType,
  StatsByRegion,
  StructureType,
  UsagerDecisionStatut,
} from "../../../../../../_common";

export type AdminStructuresStatsVM = {
  usersCount: number;
  structuresCount: number;
  usagersCount: number;
  usagersCountByStatut: {
    status: UsagerDecisionStatut;
    label: string;
    count: number;
  }[];
  usagersDocumentsCount: number;
  structuresCountByRegion: StatsByRegion;
  structuresCountBySmsEnabled: number;
  structuresCountByType: {
    type: StructureType;
    label: string;
    count: number;
  }[];
  interactionsCountByType: {
    type: InteractionType;
    label: string;
    count: number;
  }[];

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
