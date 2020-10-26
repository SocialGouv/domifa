import { Structure } from "../../structures/structure-interface";

export type StatsDeploiementExportModel = {
  exportDate: Date;
  structures: Structure[];
  usagersCountByStructureId: { [structureId: string]: number };
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
