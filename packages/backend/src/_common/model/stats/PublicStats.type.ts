import { StatsByStructureType } from "./StatsByStructureType.type";
import { StatsByMonth } from ".";

export type PublicStats = {
  // Stats globales
  usagersCount: number;
  usersCount: number;
  structuresCount: number;
  courrierInCount: number;
  courrierOutCount: number;
  interactionsCountByMonth: StatsByMonth;
  usagersCountByMonth: StatsByMonth;
  // Structures par région ou département. Par défaut on utilise le terme "region" pour les 2 cas
  structuresCountByRegion: {
    region: string;
    count: number;
  }[];
  // Structures par type de structure
  structuresCountByTypeMap: StatsByStructureType;
};
