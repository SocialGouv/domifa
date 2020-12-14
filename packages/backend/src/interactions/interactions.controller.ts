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
import { Usager } from "../usagers/interfaces/usagers";
import { UsagersService } from "../usagers/services/usagers.service";
import { AppAuthUser } from "../_common/model";
import { InteractionDto } from "./interactions.dto";
import { InteractionsService } from "./interactions.service";
import { InteractionType } from "./InteractionType.type";

@UseGuards(AuthGuard("jwt"), UsagerAccessGuard)
@ApiTags("interactions")
@Controller("interactions")
export class InteractionsController {
  constructor(
    private readonly interactionService: InteractionsService,
    private readonly usagersService: UsagersService
  ) {}

  @Post(":id")
  public postInteraction(
    @Body() interaction: InteractionDto,
    @CurrentUser() user: AppAuthUser,
    @CurrentUsager() usager: Usager
  ) {
    return this.interactionService.create({ interaction, user, usager });
  }

  @Get(":id/:limit")
  public async getInteractions(
    @Param("limit") limit: number,
    @CurrentUser() user: AppAuthUser,
    @CurrentUsager() usager: Usager
  ) {
    return this.interactionService.find(usager.id, user);
  }

  @Delete(":id/:interactionId")
  public async deleteInteraction(
    @Param("interactionId") interactionId: number,
    @CurrentUser() user: AppAuthUser,
    @CurrentUsager() usager: Usager
  ) {
    const interactionToDelete = await this.interactionService.findOne(
      usager.id,
      interactionId,
      user
    );

    if (!interactionToDelete || interactionToDelete === null) {
      throw new HttpException("INTERACTION_NOT_FOUND", HttpStatus.BAD_REQUEST);
    }

    if (interactionToDelete.type === "npai") {
      usager.options.npai.actif = false;
      usager.options.npai.dateDebut = null;

      const delInteraction = await this.interactionService.delete(
        usager.id,
        interactionId,
        user
      );

      if (delInteraction) {
        return this.usagersService.patch(usager, usager._id);
      }
    }

    const len = interactionToDelete.type.length;

    const interactionOut =
      interactionToDelete.type.substring(len - 3) === "Out";
    const interactionIn =
      interactionToDelete.type.substring(len - 2) ===
      (("In" as unknown) as InteractionType);

    if (interactionIn) {
      const inType = ((interactionToDelete.type.substring(0, len - 2) +
        "Out") as unknown) as InteractionType;

      const last = await this.interactionService.findLastInteraction(
        usager.id,
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

    // Check s'il s'agit du dernier passage
    const lastTwo = await this.interactionService.deuxDerniersPassages(
      usager.id,
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

    const deletedInteraction = await this.interactionService.delete(
      usager.id,
      interactionId,
      user
    );
    if (deletedInteraction === null || !deletedInteraction) {
      throw new HttpException(
        "INTERACTION_DELETE_IMPOSSIBLE",
        HttpStatus.BAD_REQUEST
      );
    }
    return this.usagersService.patch(usager, usager._id);
  }
}
