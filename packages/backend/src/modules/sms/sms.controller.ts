import {
  ALL_USER_STRUCTURE_ROLES,
  PageMeta,
  PageResults,
  Usager,
} from "@domifa/common";
import { Controller, UseGuards, Post, Body } from "@nestjs/common";
import { AuthGuard } from "@nestjs/passport";
import { ApiTags, ApiBearerAuth } from "@nestjs/swagger";
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
@AllowUserStructureRoles(...ALL_USER_STRUCTURE_ROLES)
@ApiTags("sms")
export class SmsController {
  @ApiBearerAuth()
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
