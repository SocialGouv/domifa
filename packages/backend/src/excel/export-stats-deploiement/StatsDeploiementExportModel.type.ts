import { StatsDeploiementStructureExportModel } from "./StatsDeploiementStructureExportModel.type";

export type StatsDeploiementExportModel = {
  exportDate: Date;
  structures: StatsDeploiementStructureExportModel[];
  usagersAyantsDroitsByStructureId: { [structureId: string]: number };
  usagersAllCountByStructureId: { [structureId: string]: number };
  usagersValideCountByStructureId: { [structureId: string]: number };
  usagersCountByStatut: { [statut: string]: number };
  structuresCountByType: { [type: string]: number };
  structuresCountByRegion: {
    region: string;
    count: number;
  }[];
  usagersActifs: {
    domicilies: number;
    ayantsDroits: number;
    actifs: number;
  };
  usersCount: number;
  docsCount: number;
  interactionsCountByStatut: {
    [statut: string]: number;
  };
};
