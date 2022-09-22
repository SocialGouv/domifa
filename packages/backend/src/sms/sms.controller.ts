import { Controller, Get, UseGuards } from "@nestjs/common";
import { AuthGuard } from "@nestjs/passport";
import { ApiBearerAuth, ApiTags } from "@nestjs/swagger";

import { AllowUserProfiles } from "../auth/decorators";
import { CurrentUsager } from "../auth/decorators/current-usager.decorator";

import { AppUserGuard } from "../auth/guards";
import { UsagerAccessGuard } from "../auth/guards/usager-access.guard";
import { UsagerLight } from "../_common/model";
import { MessageSmsService } from "./services/message-sms.service";

@Controller("sms")
@UseGuards(AuthGuard("jwt"), AppUserGuard)
@ApiTags("sms")
export class SmsController {
  constructor(private readonly messageSmsService: MessageSmsService) {}

  @ApiBearerAuth()
  @AllowUserProfiles("structure")
  @UseGuards(AuthGuard("jwt"), AppUserGuard, UsagerAccessGuard)
  @Get("usager/:usagerRef")
  public async getUsagerSms(@CurrentUsager() usager: UsagerLight) {
    return await this.messageSmsService.findAll(usager);
  }
}
