import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  UseGuards,
  HttpException,
  HttpStatus,
} from "@nestjs/common";
import { AuthGuard } from "@nestjs/passport";
import { UsagerAccessGuard } from "../auth/guards/usager-access.guard";
import { CurrentUsager } from "../auth/current-usager.decorator";
import { CurrentUser } from "../auth/current-user.decorator";

import { Usager } from "../usagers/interfaces/usagers";
import { User } from "../users/user.interface";
import { InteractionDto } from "./interactions.dto";
import { InteractionsService } from "./interactions.service";
import { UsagersService } from "../usagers/services/usagers.service";
import { ApiTags } from "@nestjs/swagger";

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
    @Body() interactionDto: InteractionDto,
    @CurrentUser() user: User,
    @CurrentUsager() usager: Usager
  ) {
    return this.interactionService.create(usager, user, interactionDto);
  }

  @Get(":id/:limit")
  public getInteractions(
    @Param("limit") limit: number,
    @CurrentUser() user: User,
    @CurrentUsager() usager: Usager
  ) {
    return this.interactionService.find(usager.id, limit, user);
  }

  @Delete(":id/:interactionId")
  public async deleteInteraction(
    @Param("interactionId") interactionId: string,
    @CurrentUser() user: User,
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
    const interactionIn = interactionToDelete.type.substring(len - 2) === "In";

    if (interactionIn) {
      const inType = interactionToDelete.type.substring(0, len - 2) + "Out";

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

    const newUsager = await this.usagersService.patch(usager, usager._id);

    const deletedInteraction = await this.interactionService.delete(
      usager.id,
      interactionId,
      user
    );

    if (newUsager && deletedInteraction) {
      return newUsager;
    } else {
      throw new HttpException(
        "INTERACTION_DELETE_IMPOSSIBLE",
        HttpStatus.BAD_REQUEST
      );
    }
  }
}
