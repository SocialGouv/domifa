import { StatsDeploiementStructureExportModel } from "./StatsDeploiementStructureExportModel.type";

export type StatsDeploiementExportModel = {
  exportDate: Date;
  structures: StatsDeploiementStructureExportModel[];
  usagersAllCountByStructureId: { [structureId: string]: number };
  usagersValideCountByStructureId: { [structureId: string]: number };
  usagersCountByStatut: { [statut: string]: number };
  structuresCountByType: { [type: string]: number };
  structuresCountByRegion: {
    region: string;
    count: number;
  }[];
  usersCount: number;
  docsCount: number;
  interactionsCountByStatut: {
    [statut: string]: number;
  };
};
