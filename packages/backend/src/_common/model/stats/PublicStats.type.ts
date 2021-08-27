import { StatsByMonth } from ".";

export type PublicStats = {
  // Stats globales
  courrierOutCount: number;
  usagersCount: number;
  usersCount: number;
  structuresCount: number;
  // Statistiques mensuelles
  interactionsCount: number;
  interactionsCountByMonth?: StatsByMonth;
  usagersCountByMonth?: StatsByMonth;
  // Structures par région
  structuresCountByRegion?: {
    region: string;
    count: number;
  }[]; // Structures par région
  structuresCountByDepartement?: {
    region: string;
    count: number;
  }[];
  // Structures par région
  structuresCountByTypeMap?: {
    [type: string]: number;
  };
};
