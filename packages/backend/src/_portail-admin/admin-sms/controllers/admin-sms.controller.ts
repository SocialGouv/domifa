import { Controller, Get, Param, UseGuards } from "@nestjs/common";
import { AuthGuard } from "@nestjs/passport";

import { AppUserGuard } from "../../../auth/guards";
import { AllowUserProfiles } from "../../../auth/decorators";
import { AdminSmsService } from "../services/admin-sms.service";
import {
  InteractionTypeStats,
  StatsPeriod,
  StatsGlobal,
} from "../../../_common/model";

@UseGuards(AuthGuard("jwt"), AppUserGuard)
@Controller("admin/sms")
export class AdminSmsController {
  constructor(private readonly adminSmsService: AdminSmsService) {}

  @Get("stats/global/:type")
  @AllowUserProfiles("super-admin-domifa")
  public async statsGlobal(@Param("type") type: StatsGlobal) {
    const res = await this.adminSmsService.getStatsGlobal(type);
    return res;
  }

  @Get("stats/:smsId/:period")
  @AllowUserProfiles("super-admin-domifa")
  public async stats(
    @Param("smsId") smsId: InteractionTypeStats,
    @Param("period") period: StatsPeriod
  ) {
    const res = await this.adminSmsService.getStats(smsId, period);
    return res;
  }
}
