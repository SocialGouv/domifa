import { Structure } from "../../structures/structure-interface";

export type StatsDeploiement = {
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
