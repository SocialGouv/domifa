import { StatsByMonth, StatsByRegion } from ".";

export type PublicStats = {
  // Stats globales
  courrierOutCount: number;
  usagersCount: number;
  usersCount: number;
  structuresCount: number;
  // Statistiques mensuelles
  interactionsCountByMonth?: StatsByMonth;
  interactionsCount?: number;
  usagersCountByMonth?: StatsByMonth;
  // Structures par région
  structuresCountByRegion?: StatsByRegion; // Structures par région
  structuresCountByDepartement?: StatsByRegion;
  // Structures par région
  structuresCountByTypeMap: {
    [type: string]: number;
  };
  interactionsCountByTypeMap: {
    [statut: string]: number;
  };
};
