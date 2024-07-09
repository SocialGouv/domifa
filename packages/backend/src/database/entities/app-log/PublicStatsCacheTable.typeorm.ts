import { AppEntity, PublicStats } from "@domifa/common";
import { Entity, Column } from "typeorm";
import { AppTypeormTable } from "../_core";

export type PublicStatsCache = AppEntity & {
  key: string;
  stats: PublicStats;
};

@Entity({ name: "public_stats_cache" })
export class PublicStatsCacheTable
  extends AppTypeormTable<PublicStatsCache>
  implements PublicStatsCache
{
  @Column({ type: "varchar", length: 200 })
  key: string;

  @Column({ type: "jsonb" })
  stats: PublicStats;
}
