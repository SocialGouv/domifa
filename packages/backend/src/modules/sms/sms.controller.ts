import { Usager } from "@domifa/common";
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
import { PageMetaDto, PageOptionsDto, PageResultsDto } from "../../usagers/dto";
import { ObjectLiteral } from "typeorm";

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
    const queryBuilder = messageSmsRepository.createQueryBuilder("message_sms");

    const whereConditions: ObjectLiteral = {
      structureId: currentUsager.structureId,
      usagerRef: currentUsager.ref,
    };

    queryBuilder
      .where(whereConditions)
      .orderBy("id", pageOptionsDto.order)
      .skip((pageOptionsDto.page - 1) * pageOptionsDto.take)
      .take(pageOptionsDto.take);

    const itemCount = await queryBuilder.getCount();
    const { entities } = await queryBuilder.getRawAndEntities();
    const pageMetaDto = new PageMetaDto({ itemCount, pageOptionsDto });
    return new PageResultsDto(entities, pageMetaDto);
  }
}
