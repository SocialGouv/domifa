import {
  Body,
  Controller,
  Delete,
  Get,
  HttpException,
  HttpStatus,
  Param,
  Post,
  UseGuards,
} from "@nestjs/common";
import { AuthGuard } from "@nestjs/passport";
import { ApiTags } from "@nestjs/swagger";
import { CurrentUsager } from "../auth/current-usager.decorator";
import { CurrentUser } from "../auth/current-user.decorator";
import { UsagerAccessGuard } from "../auth/guards/usager-access.guard";
import { UsagerLight } from "../database";
import { SmsService } from "../sms/services/sms.service";

import { UsagersService } from "../usagers/services/usagers.service";
import { AppAuthUser } from "../_common/model";
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
  public async postInteraction(
    @Body() interaction: InteractionDto,
    @CurrentUser() user: AppAuthUser,
    @CurrentUsager() usager: UsagerLight
  ) {
    const createdInteraction = await this.interactionsService.create({
      interaction,
      user,
      usager,
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
          // Suppression du SMS en file d'attente
          const smsToDelete = await this.smsService.deleteSmsInteraction(
            usager,
            user,
            interaction
          );
        }
      }
    }

    return createdInteraction;
  }

  @Get(":usagerRef/:limit")
  public async getInteractions(
    @Param("limit") limit: number,
    @CurrentUser() user: AppAuthUser,
    @CurrentUsager() usager: UsagerLight
  ) {
    return this.interactionsService.find(usager.ref, user);
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
      (("Out" as unknown) as InteractionType);

    const interactionIn =
      interactionToDelete.type.substring(len - 2) ===
      (("In" as unknown) as InteractionType);

    if (interactionIn) {
      // Suppression du SMS en file d'attente
      const smsToDelete = await this.smsService.deleteSmsInteraction(
        usager,
        user,
        interactionToDelete
      );

      const inType = ((interactionToDelete.type.substring(0, len - 2) +
        "Out") as unknown) as InteractionType;

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

      // TODO: update SMS si distribution
    }

    // Check s'il s'agit du dernier passage
    const lastTwo = await this.interactionsService.deuxDerniersPassages(
      usager.ref,
      user
    );

    if (lastTwo && lastTwo !== null && lastTwo.length > 1) {
      if (lastTwo[0]._id.toString() === interactionToDelete._id.toString()) {
        // Vérification si la personne n'a pas de date de dernier passage
        usager.lastInteraction.dateInteraction =
          lastTwo.length < 2
            ? usager.decision.dateDecision
            : lastTwo[1].dateInteraction;
      }
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
