import { Controller, Get, UseGuards } from "@nestjs/common";
import { AuthGuard } from "@nestjs/passport";
import { ApiBearerAuth, ApiTags } from "@nestjs/swagger";

import { AllowUserProfiles } from "../auth/decorators";
import { CurrentUsager } from "../auth/decorators/current-usager.decorator";

import { AppUserGuard } from "../auth/guards";
import { UsagerAccessGuard } from "../auth/guards/usager-access.guard";
import { messageSmsRepository } from "../database";
import { UsagerLight } from "../_common/model";

@Controller("sms")
@UseGuards(AuthGuard("jwt"), AppUserGuard)
@ApiTags("sms")
export class SmsController {
  @ApiBearerAuth()
  @AllowUserProfiles("structure")
  @UseGuards(AuthGuard("jwt"), AppUserGuard, UsagerAccessGuard)
  @Get("usager/:usagerRef")
  public async getUsagerSms(@CurrentUsager() usager: UsagerLight) {
    return messageSmsRepository.find({
      where: {
        usagerRef: usager.ref,
        structureId: usager.structureId,
      },
      order: {
        createdAt: "DESC",
      },
      skip: 0,
      take: 10,
    });
  }
}
