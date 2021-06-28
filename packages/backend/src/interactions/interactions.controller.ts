import {
  Body,
  Controller,
  Delete,
  Get,
  HttpException,
  HttpStatus,
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
import { SmsService } from "../sms/services/sms.service";
import { UsagersService } from "../usagers/services/usagers.service";
import { AppAuthUser, UsagerLight } from "../_common/model";
import { InteractionType } from "../_common/model/interaction";
import { InteractionDto } from "./interactions.dto";
import { InteractionsService } from "./interactions.service";

@UseGuards(AuthGuard("jwt"), UsagerAccessGuard)
@ApiTags("interactions")
@Controller("interactions")
export class InteractionsController {
  constructor(
    private readonly interactionsService: InteractionsService,
    private readonly usagersService: UsagersService,
    private readonly smsService: SmsService
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

      usager = await this.interactionsService.create({
        interaction,
        usager,
        user,
      });

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
              user,
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
    const interactionToDelete = await this.interactionsService.findOne(
      usager.ref,
      interactionId,
      user
    );

    if (!interactionToDelete || interactionToDelete === null) {
      throw new HttpException("INTERACTION_NOT_FOUND", HttpStatus.BAD_REQUEST);
    }

    if (interactionToDelete.type === "npai") {
      usager.options.npai.actif = false;
      usager.options.npai.dateDebut = null;

      const delInteraction = await this.interactionsService.delete(
        usager.ref,
        interactionId,
        user
      );

      if (delInteraction) {
        return this.usagersService.patch({ uuid: usager.uuid }, usager);
      }
    }

    const len = interactionToDelete.type.length;

    const interactionOut =
      interactionToDelete.type.substring(len - 3) ===
      ("Out" as unknown as InteractionType);

    const interactionIn =
      interactionToDelete.type.substring(len - 2) ===
      ("In" as unknown as InteractionType);

    if (interactionIn) {
      // Suppression du SMS en file d'attente
      const smsToDelete = await this.smsService.deleteSmsInteraction(
        usager,
        user,
        interactionToDelete
      );

      const inType = (interactionToDelete.type.substring(0, len - 2) +
        "Out") as unknown as InteractionType;

      const last = await this.interactionsService.findLastInteraction(
        usager.ref,
        interactionToDelete.dateInteraction,
        inType,
        user,
        "in"
      );

      if (!last || last === null) {
        if (interactionToDelete.nbCourrier) {
          usager.lastInteraction[interactionToDelete.type] =
            usager.lastInteraction[interactionToDelete.type] -
            interactionToDelete.nbCourrier;
        }
      }
    } else if (interactionOut) {
      const inType = interactionToDelete.type.substring(0, len - 3) + "In";

      if (interactionToDelete.nbCourrier) {
        usager.lastInteraction[inType] =
          usager.lastInteraction[inType] + interactionToDelete.nbCourrier;
      }
    }

    // Recherche de la dernière date de passage
    const lastTwo = await this.interactionsService.findLastInteractionOk(
      usager,
      user
    );

    if (lastTwo && lastTwo !== null && lastTwo.length) {
      // Si la date de la dernière décision a lieu après la dernière interaction, on l'assigne à lastInteraction.dateInteraction
      usager.lastInteraction.dateInteraction =
        lastTwo[0].dateInteraction > new Date(usager.decision.dateDecision)
          ? lastTwo[0].dateInteraction
          : usager.decision.dateDecision;
    } else {
      usager.lastInteraction.dateInteraction = usager.decision.dateDecision;
    }

    usager.lastInteraction.enAttente =
      usager.lastInteraction.courrierIn > 0 ||
      usager.lastInteraction.colisIn > 0 ||
      usager.lastInteraction.recommandeIn > 0;

    const deletedInteraction = await this.interactionsService.delete(
      usager.ref,
      interactionId,
      user
    );

    if (deletedInteraction === null || !deletedInteraction) {
      throw new HttpException(
        "INTERACTION_DELETE_IMPOSSIBLE",
        HttpStatus.BAD_REQUEST
      );
    }
    return this.usagersService.patch({ uuid: usager.uuid }, usager);
  }
}
