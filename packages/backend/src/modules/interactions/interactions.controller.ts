import {
  Body,
  Controller,
  Delete,
  Param,
  ParseArrayPipe,
  ParseIntPipe,
  ParseUUIDPipe,
  Post,
  UseGuards,
} from "@nestjs/common";
import { AuthGuard } from "@nestjs/passport";
import { ApiTags } from "@nestjs/swagger";
import {
  AllowUserProfiles,
  CurrentUser,
  CurrentUsager,
  CurrentInteraction,
  AllowUserStructureRoles,
} from "../../auth/decorators";
import {
  AppUserGuard,
  UsagerAccessGuard,
  InteractionsGuard,
} from "../../auth/guards";
import { userUsagerLoginRepository } from "../../database";
import {
  USER_STRUCTURE_ROLE_ALL,
  UserStructureAuthenticated,
} from "../../_common/model";
import { InteractionDto } from "./dto";
import {
  InteractionsDeletor,
  InteractionsService,
  interactionsCreator,
} from "./services";
import {
  PageMetaDto,
  PageOptionsDto,
  PageResultsDto,
} from "../../usagers/dto/pagination";
import { CommonInteraction, Usager } from "@domifa/common";
import { MessageSmsService } from "../sms/services/message-sms.service";

@UseGuards(AuthGuard("jwt"), AppUserGuard)
@ApiTags("interactions")
@AllowUserProfiles("structure")
@AllowUserStructureRoles(...USER_STRUCTURE_ROLE_ALL)
@Controller("interactions")
export class InteractionsController {
  constructor(
    private readonly interactionDeletor: InteractionsDeletor,
    private readonly interactionsService: InteractionsService,
    private readonly messageSmsService: MessageSmsService
  ) {}

  @Post(":usagerRef")
  @UseGuards(UsagerAccessGuard)
  public async postInteractions(
    @Body(new ParseArrayPipe({ items: InteractionDto }))
    interactions: InteractionDto[],
    @CurrentUser() user: UserStructureAuthenticated,
    @CurrentUsager() currentUsager: Usager
  ): Promise<Usager> {
    for (const interaction of interactions) {
      const created = await interactionsCreator.createInteraction({
        interaction,
        usager: currentUsager,
        user,
      });

      await this.messageSmsService.updateSmsAfterCreation({
        interaction: created.interaction,
        structure: user.structure,
        usager: created.usager,
      });

      currentUsager = created.usager;
    }

    return currentUsager;
  }

  @Post("search/:usagerRef")
  @UseGuards(UsagerAccessGuard)
  public async getInteractions(
    @Param("usagerRef", new ParseIntPipe()) _usagerRef: number,
    @CurrentUser() user: UserStructureAuthenticated,
    @CurrentUsager() currentUsager: Usager,
    @Body() pageOptionsDto: PageOptionsDto
  ) {
    return await this.interactionsService.searchInteractions(
      user.structureId,
      currentUsager.uuid,
      pageOptionsDto
    );
  }

  @Post("search-login-portail/:usagerRef")
  @UseGuards(UsagerAccessGuard)
  public async getLoginPortailHistory(
    @Param("usagerRef", new ParseIntPipe()) _usagerRef: number,
    @CurrentUser() user: UserStructureAuthenticated,
    @CurrentUsager() currentUsager: Usager,
    @Body() pageOptionsDto: PageOptionsDto
  ) {
    const queryBuilder = userUsagerLoginRepository
      .createQueryBuilder("user_usager_login")
      .select([`"createdAt"`])
      .where({
        structureId: user.structureId,
        usagerUUID: currentUsager.uuid,
      })
      .orderBy(`"createdAt"`, pageOptionsDto.order)
      .skip((pageOptionsDto.page - 1) * pageOptionsDto.take)
      .take(pageOptionsDto.take);

    const itemCount = await queryBuilder.getCount();
    const entities = await queryBuilder.getRawMany();
    const pageMetaDto = new PageMetaDto({ itemCount, pageOptionsDto });
    return new PageResultsDto(entities, pageMetaDto);
  }

  @UseGuards(UsagerAccessGuard, InteractionsGuard)
  @Delete(":usagerRef/:interactionUuid")
  public async deleteInteraction(
    @CurrentUser() user: UserStructureAuthenticated,
    @CurrentUsager() usager: Usager,
    @Param("interactionUuid", new ParseUUIDPipe()) _interactionUuid: string,
    @Param("usagerRef", new ParseIntPipe()) _usagerRef: number,
    @CurrentInteraction() interaction: CommonInteraction
  ) {
    return await this.interactionDeletor.deleteInteraction({
      interaction,
      usager,
      structure: user.structure,
    });
  }
}
