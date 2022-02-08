import { StatsByMonth } from ".";

export type PublicStats = {
  // Stats globales

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
    departement: string;
    count: number;
  }[];
  // Structures par région
  structuresCountByTypeMap?: {
    [type: string]: number;
  };
};
