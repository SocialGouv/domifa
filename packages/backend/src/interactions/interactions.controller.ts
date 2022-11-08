import { MessageSmsService } from "./../sms/services/message-sms.service";
import {
  Body,
  Controller,
  Delete,
  Get,
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
} from "../auth/decorators";
import {
  AppUserGuard,
  UsagerAccessGuard,
  InteractionsGuard,
} from "../auth/guards";
import { interactionRepository } from "../database";
import {
  UserStructureAuthenticated,
  UsagerLight,
  Interactions,
} from "../_common/model";
import { InteractionDto } from "./dto";
import { InteractionsDeletor, interactionsCreator } from "./services";

@UseGuards(AuthGuard("jwt"), AppUserGuard, UsagerAccessGuard)
@ApiTags("interactions")
@Controller("interactions")
export class InteractionsController {
  constructor(
    private readonly interactionDeletor: InteractionsDeletor,
    private readonly messageSmsService: MessageSmsService
  ) {}

  @Post(":usagerRef")
  @AllowUserProfiles("structure")
  public async postInteractions(
    @Body(new ParseArrayPipe({ items: InteractionDto }))
    interactions: InteractionDto[],
    @CurrentUser() user: UserStructureAuthenticated,
    @CurrentUsager() usager: UsagerLight
  ) {
    // Parcours des demandes
    for (const interaction of interactions) {
      const created = await interactionsCreator.createInteraction({
        interaction,
        usager,
        user,
      });

      usager = created.usager;

      await this.messageSmsService.updateSmsAfterCreation({
        interaction: created.interaction,
        structure: user.structure,
        usager,
      });
    }
    return usager;
  }

  @Get(":usagerRef")
  @AllowUserProfiles("structure")
  public async getInteractions(
    @Param("usagerRef", new ParseIntPipe()) _usagerRef: number,
    @CurrentUser() user: UserStructureAuthenticated,
    @CurrentUsager() usager: UsagerLight
  ) {
    return interactionRepository.findWithFilters({
      usagerRef: usager.ref,
      structureId: user.structureId,
    });
  }

  @UseGuards(InteractionsGuard)
  @AllowUserProfiles("structure")
  @Delete(":usagerRef/:interactionUuid")
  public async deleteInteraction(
    @CurrentUser() user: UserStructureAuthenticated,
    @CurrentUsager() usager: UsagerLight,
    @Param("interactionUuid", new ParseUUIDPipe()) _interactionUuid: string,
    @Param("usagerRef", new ParseIntPipe()) _usagerRef: number,
    @CurrentInteraction() interaction: Interactions
  ) {
    return this.interactionDeletor.deleteOrRestoreInteraction({
      interaction,
      user,
      usager,
      structure: user.structure,
    });
  }
}
