import { Controller, Get, Param, UseGuards } from "@nestjs/common";
import { AuthGuard } from "@nestjs/passport";

import { AppUserGuard } from "../../../auth/guards";
import { AllowUserProfiles } from "../../../auth/decorators";
import { AdminSmsService } from "../services/admin-sms.service";
import { MessageSmsId, StatsPeriod } from "../../../_common/model";

@UseGuards(AuthGuard("jwt"), AppUserGuard)
@Controller("admin/sms")
export class AdminSmsController {
  constructor(private readonly adminSmsService: AdminSmsService) {}

  @Get("stats/global")
  @AllowUserProfiles("super-admin-domifa")
  public async statsGlobal() {
    const res = await this.adminSmsService.getStatsGlobal();
    return res;
  }

  @Get("stats/:messageSmsId/:period")
  @AllowUserProfiles("super-admin-domifa")
  public async stats(
    @Param("messageSmsId") messageSmsId: MessageSmsId,
    @Param("period") period: StatsPeriod
  ) {
    return await this.adminSmsService.getStats(messageSmsId, period);
  }
}
