import { Injectable } from "@nestjs/common";
import { format } from "date-fns";
import { fr } from "date-fns/locale";

import { MessageSmsId, StatsPeriod } from "../../../_common/model";
import { messageSmsRepository } from "../../../database";

@Injectable()
export class AdminSmsService {
  public async getStatsGlobal() {
    const res = await messageSmsRepository.statsSmsGlobal();
    const formatedData = res.map((data) => ({
      name: format(data.sendDate, "d MMM y", { locale: fr }),
      value: data.count,
    }));
    return formatedData;
  }

  public async getStats(messageSmsId: MessageSmsId, period: StatsPeriod) {
    const res =
      period === "days"
        ? await messageSmsRepository.statsSmsByDays(messageSmsId)
        : await messageSmsRepository.statsSmsByMonths(messageSmsId);

    const dateFormat = period === "days" ? "d MMM yyyy" : "MMM yyyy";
    const formatedData = res.map((data) => ({
      name: format(data.sendDate, dateFormat, { locale: fr }),
      value: data.count,
    }));

    return formatedData;
  }
}
