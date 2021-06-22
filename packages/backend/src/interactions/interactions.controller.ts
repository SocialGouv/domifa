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
import { MessageSmsService } from "../sms/services/message-sms.service";
import { UsagersService } from "../usagers/services/usagers.service";
import { AppAuthUser, UsagerLight } from "../_common/model";
import { InteractionType } from "../_common/model/interaction";
import { InteractionDto } from "./interactions.dto";
import { InteractionsDeletor, InteractionsService } from "./services";

@UseGuards(AuthGuard("jwt"), UsagerAccessGuard)
@ApiTags("interactions")
@Controller("interactions")
export class InteractionsController {
  constructor(
    private readonly interactionsService: InteractionsService,
    private readonly interactionDeletor: InteractionsDeletor,
    private readonly usagersService: UsagersService,
    private readonly smsService: MessageSmsService
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

      const created = await this.interactionsService.create({
        interaction,
        usager,
        user,
      });
      usager = created.usager;

      // 1. Vérifier l'activation des SMS par la structure
      if (
        user.structure.sms.enabledByDomifa &&
        user.structure.sms.enabledByStructure
      ) {
        // 2. Vérifier l'activation du SMS pour l'usager
        if (usager.preference?.phone === true) {
          // Courrier / Colis / Recommandé entrant = Envoi de SMS à prévoir
          if (
            interaction.type === "courrierIn" ||
            interaction.type === "colisIn" ||
            interaction.type === "recommandeIn"
          ) {
            // TODO:  3. Numéro de téléphone valide
            const sms = await this.smsService.createSmsInteraction(
              usager,
              user,
              interaction
            );
          } else if (
            interaction.type === "courrierOut" ||
            interaction.type === "colisOut" ||
            interaction.type === "recommandeOut"
          ) {
            const len = interaction.type.length;

            const inType = (interaction.type.substring(0, len - 3) +
              "In") as unknown as InteractionType;

            interaction.type = inType;
            // Suppression du SMS en file d'attente
            const smsToDelete = await this.smsService.deleteSmsInteractionOut(
              usager,
              user.structureId,
              interaction
            );
          }
        }
      }
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
    return this.interactionDeletor.deleteInteraction({
      interactionId,
      user,
      usagerRef: usager.ref,
    });
  }
}
