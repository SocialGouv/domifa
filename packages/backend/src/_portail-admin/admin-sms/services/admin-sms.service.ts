import { Injectable } from "@nestjs/common";
import { format } from "date-fns";
import { fr } from "date-fns/locale";

import {
  InteractionTypeStats,
  Period,
  StatsGlobal,
} from "../../../_common/model";
import { messageSmsRepository, structureRepository } from "../../../database";

@Injectable()
export class AdminSmsService {
  constructor() {}

  public async getStatsGlobal(type: StatsGlobal) {
    if (type === "sms") {
      const res = await messageSmsRepository.statsSmsGlobal();
      const formatedData = res.map((data) => ({
        name: format(data.sendDate, "d MMM y", { locale: fr }),
        value: data.count,
      }));
      return formatedData;
    } else if (type === "structure") {
      const withoutDateActivation =
        await structureRepository.statsStructureSmsWithoutDateActivation();
      const withDateActivation =
        await structureRepository.statsStructureSmsWithDateActivation();

      const structureSms = [
        {
          dateActivation: new Date("2021-04-01"),
          count: withoutDateActivation[0].count,
        },
        ...withDateActivation,
      ];

      const formatedData = structureSms.map((data) => ({
        name: format(data.dateActivation, "d MMM y", { locale: fr }),
        value: data.count,
      }));

      return formatedData;
    }

    return [];
  }

  public async getStats(smsId: InteractionTypeStats, period: Period) {
    const res =
      period === "days"
        ? await messageSmsRepository.statsSmsByDays(smsId)
        : await messageSmsRepository.statsSmsByMonths(smsId);
    const formatedData = res.map((data) => ({
      name: format(data.sendDate, "d MMM y", { locale: fr }),
      value: data.count,
    }));

    return formatedData;
  }
}
