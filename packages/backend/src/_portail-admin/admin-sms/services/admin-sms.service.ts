import { Injectable } from "@nestjs/common";
import { format } from "date-fns";
import { fr } from "date-fns/locale";

import {
  InteractionTypeStats,
  StatsPeriod,
  StatsGlobal,
} from "../../../_common/model";
import { messageSmsRepository } from "../../../database";

@Injectable()
export class AdminSmsService {
  public async getStatsGlobal(type: StatsGlobal) {
    if (type === "sms") {
      const res = await messageSmsRepository.statsSmsGlobal();
      const formatedData = res.map((data) => ({
        name: format(data.sendDate, "d MMM y", { locale: fr }),
        value: data.count,
      }));
      return formatedData;
    }

    return [];
  }

  public async getStats(smsId: InteractionTypeStats, period: StatsPeriod) {
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
