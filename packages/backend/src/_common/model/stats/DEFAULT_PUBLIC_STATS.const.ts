import { PublicStats } from "./PublicStats.type";

export const DEFAULT_PUBLIC_STATS: PublicStats = {
  structuresCountByRegion: [],
  interactionsCountByMonth: [], // Par défaut: courriers distribués
  structuresCountByDepartement: [],
  usagersCount: 0,
  usagersCountByMonth: [],
  usersCount: 0,
  interactionsCount: 0,
  structuresCount: 0,
  structuresCountByTypeMap: {
    asso: 0,
    ccas: 0,
    cias: 0,
  },
};
