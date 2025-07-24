import { Usager } from "@domifa/common";
import { Controller, UseGuards, Get } from "@nestjs/common";
import { AuthGuard } from "@nestjs/passport";
import { ApiTags, ApiBearerAuth } from "@nestjs/swagger";
import { USER_STRUCTURE_ROLE_ALL } from "../../_common/model";
import {
  AllowUserProfiles,
  AllowUserStructureRoles,
  CurrentUsager,
} from "../../auth/decorators";
import { AppUserGuard, UsagerAccessGuard } from "../../auth/guards";
import { messageSmsRepository } from "../../database";

@Controller("sms")
@UseGuards(AuthGuard("jwt"), AppUserGuard)
@AllowUserProfiles("structure")
@AllowUserStructureRoles(...USER_STRUCTURE_ROLE_ALL)
@ApiTags("sms")
export class SmsController {
  @ApiBearerAuth()
  @UseGuards(UsagerAccessGuard)
  @Get("usager/:usagerRef")
  public async getUsagerSms(@CurrentUsager() currentUsager: Usager) {
    return await messageSmsRepository.find({
      where: {
        usagerRef: currentUsager.ref,
        structureId: currentUsager.structureId,
      },
      order: {
        createdAt: "DESC",
      },
      skip: 0,
      take: 50,
    });
  }
}
