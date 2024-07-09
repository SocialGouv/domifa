import {
  type StatsByMonth,
  type StatsByLocality,
  type StatsByStructureType,
} from "../types";

export class PublicStats {
  public usersCount: number = 0;
  public courrierOutCount: number = 0;
  public interactionsCountByMonth: StatsByMonth;
  public usagersCountByMonth: StatsByMonth;
  public structuresCountByRegion: StatsByLocality;
  public structuresCountByTypeMap: StatsByStructureType;

  // Shared with homepage
  public courrierInCount: number = 0;
  public usagersCount: number = 0;
  public structuresCount: number = 0;
  public actifs: number = 0;

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  constructor(stats?: any) {
    this.actifs = stats?.actifs ?? 0;
    this.usagersCount = stats?.usagersCount ?? 0;
    this.structuresCount = stats?.structuresCount ?? 0;
    this.courrierInCount = stats?.courrierInCount ?? 0;

    this.usersCount = stats?.usersCount ?? 0;
    this.courrierOutCount = stats?.courrierOutCount ?? 0;
    this.interactionsCountByMonth = stats?.interactionsCountByMonth ?? [];
    this.usagersCountByMonth = stats?.usagersCountByMonth ?? [];
    this.structuresCountByRegion = stats?.structuresCountByRegion ?? [];
    this.structuresCountByTypeMap = stats?.structuresCountByTypeMap ?? {
      asso: 0,
      ccas: 0,
      cias: 0,
    };
  }
}
