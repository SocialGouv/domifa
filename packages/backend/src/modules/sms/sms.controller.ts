import { PageMeta, PageResults, Usager } from "@domifa/common";
import { Controller, UseGuards, Post, Body } from "@nestjs/common";
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
import { PageOptionsDto } from "../../usagers/dto";

@Controller("sms")
@UseGuards(AuthGuard("jwt"), AppUserGuard)
@AllowUserProfiles("structure")
@AllowUserStructureRoles(...USER_STRUCTURE_ROLE_ALL)
@ApiTags("sms")
export class SmsController {
  @ApiBearerAuth()
  @UseGuards(UsagerAccessGuard)
  @Post("usager/:usagerRef")
  public async getUsagerSms(
    @CurrentUsager() currentUsager: Usager,
    @Body() pageOptionsDto: PageOptionsDto
  ) {
    const queryBuilder = messageSmsRepository
      .createQueryBuilder("message_sms")
      .where(`"structureId" = :id`, {
        id: currentUsager.structureId,
      })
      .andWhere(`"usagerRef" = :ref`, {
        ref: currentUsager.ref,
      })
      .orderBy(`"createdAt"`, pageOptionsDto.order)
      .skip(pageOptionsDto.skip)
      .take(pageOptionsDto.take);

    const [entities, itemCount] = await Promise.all([
      queryBuilder.getMany(),
      queryBuilder.getCount(),
    ]);

    const pageMetaDto = new PageMeta({
      itemCount,
      pageOptions: pageOptionsDto,
    });
    return new PageResults({ data: entities, meta: pageMetaDto });
  }
}
