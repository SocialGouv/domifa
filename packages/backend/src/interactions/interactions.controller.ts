import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseArrayPipe,
  Post,
  Query,
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
import { InteractionsSmsManager } from "./services/InteractionsSmsManager.service";

@UseGuards(AuthGuard("jwt"), AppUserGuard, UsagerAccessGuard)
@ApiTags("interactions")
@Controller("interactions")
export class InteractionsController {
  constructor(
    private readonly interactionDeletor: InteractionsDeletor,
    private readonly interactionsSmsManager: InteractionsSmsManager
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

      await this.interactionsSmsManager.updateSmsAfterCreation({
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
    @Query("filter") filterString: string,
    @Query("maxResults") maxResultsString: string,
    @CurrentUser() user: UserStructureAuthenticated,
    @CurrentUsager() usager: UsagerLight
  ) {
    // check query parameters
    const filter = filterString === "distribution" ? "distribution" : undefined;
    const maxResultsInteger = parseInt(maxResultsString, 10);
    const maxResults = maxResultsInteger > 0 ? maxResultsInteger : 20;
    return interactionRepository.findWithFilters({
      usagerRef: usager.ref,
      structureId: user.structureId,
      filter,
      maxResults,
    });
  }

  @UseGuards(InteractionsGuard)
  @AllowUserProfiles("structure")
  @Delete(":usagerRef/:interactionUuid")
  public async deleteInteraction(
    @Param("interactionUuid") interactionUuid: string,
    @CurrentUser() user: UserStructureAuthenticated,
    @CurrentUsager() usager: UsagerLight,
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
