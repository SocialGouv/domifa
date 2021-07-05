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
import { CurrentUsager } from "../auth/current-usager.decorator";
import { CurrentUser } from "../auth/current-user.decorator";
import { UsagerAccessGuard } from "../auth/guards/usager-access.guard";
import { interactionRepository } from "../database";
import { AppAuthUser, UsagerLight } from "../_common/model";
import { InteractionDto } from "./interactions.dto";
import { interactionsCreator, InteractionsDeletor } from "./services";
import { InteractionsSmsManager } from "./services/InteractionsSmsManager.service";

@UseGuards(AuthGuard("jwt"), UsagerAccessGuard)
@ApiTags("interactions")
@Controller("interactions")
export class InteractionsController {
  constructor(
    private readonly interactionDeletor: InteractionsDeletor,
    private readonly interactionsSmsManager: InteractionsSmsManager
  ) {}

  @Post(":usagerRef")
  public async postInteractions(
    @Body(new ParseArrayPipe({ items: InteractionDto }))
    interactions: InteractionDto[],
    @CurrentUser() user: AppAuthUser,
    @CurrentUsager() usager: UsagerLight
  ) {
    // Parcours des demandes
    for (let i = 0; i < interactions.length; i++) {
      const interaction: InteractionDto = interactions[i] as InteractionDto;

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
  public async getInteractions(
    @Query("filter") filterString: string,
    @Query("maxResults") maxResultsString: string,
    @CurrentUser() user: AppAuthUser,
    @CurrentUsager() usager: UsagerLight
  ) {
    // check query parameters
    const filter = filterString === "distribution" ? "distribution" : undefined;
    const maxResultsInteger = parseInt(maxResultsString, 10);
    const maxResults = maxResultsInteger > 0 ? maxResultsInteger : undefined;
    return interactionRepository.findWithFilters({
      usagerRef: usager.ref,
      structureId: user.structureId,
      filter,
      maxResults,
    });
  }

  @Delete(":usagerRef/:interactionId")
  public async deleteInteraction(
    @Param("interactionId") interactionId: number,
    @CurrentUser() user: AppAuthUser,
    @CurrentUsager() usager: UsagerLight
  ) {
    return this.interactionDeletor.deleteOrRestoreInteraction({
      interactionId,
      user,
      usagerRef: usager.ref,
      structure: user.structure,
    });
  }
}
