import {
  PageMeta,
  PageResults,
  SUPPORT_READ_ROLES,
  Usager,
} from "@domifa/common";
import { Controller, UseGuards, Post, Body } from "@nestjs/common";
import { AuthGuard } from "@nestjs/passport";
import {
  AllowUserProfiles,
  AllowUserStructureRoles,
  CurrentUsager,
} from "../../auth/decorators";
import { AppUserGuard, UsagerAccessGuard } from "../../auth/guards";
import { messageSmsRepository } from "../../database";
import { PageOptionsDto } from "../../usagers/dto";

@Controller("sms")
@UseGuards(AuthGuard("jwt"), AppUserGuard)
@AllowUserProfiles("structure")
@AllowUserStructureRoles(...SUPPORT_READ_ROLES)
export class SmsController {
  @UseGuards(UsagerAccessGuard)
  @Post("usager/:usagerRef")
  public async getUsagerSms(
    @CurrentUsager() currentUsager: Usager,
    @Body() pageOptionsDto: PageOptionsDto
  ) {
    const [entities, itemCount] = await messageSmsRepository.findAndCount({
      where: {
        structureId: currentUsager.structureId,
        usagerRef: currentUsager.ref,
      },
      order: { createdAt: pageOptionsDto.order },
      skip: pageOptionsDto.skip,
      take: pageOptionsDto.take,
    });

    return new PageResults({
      data: entities,
      meta: new PageMeta({ itemCount, pageOptions: pageOptionsDto }),
    });
  }
}
