import { Cron } from "@nestjs/schedule";
import { domifaConfig } from "../../../config";
import { structureStatsAtDateGenerator } from "./structureStatsAtDateGenerator.service";

export class StatsGeneratorCron {
  constructor() {}

  @Cron(domifaConfig().cron.stats.crontime)
  protected async generateStatsCron() {
    if (!domifaConfig().cron.enable) {
      return;
    }
    await structureStatsAtDateGenerator.generateStats("cron");
  }
}
