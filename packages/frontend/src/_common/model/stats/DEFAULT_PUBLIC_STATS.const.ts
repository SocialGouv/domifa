import { PublicStats } from "@domifa/common";

export const DEFAULT_PUBLIC_STATS: PublicStats = {
  structuresCountByRegion: [],
  interactionsCountByMonth: [], // Par défaut: courriers distribués
  usagersCount: 0,
  usagersCountByMonth: [],
  usersCount: 0,
  courrierInCount: 0,
  courrierOutCount: 0,
  structuresCount: 0,
  structuresCountByTypeMap: {
    asso: 0,
    ccas: 0,
    cias: 0,
  },
};
