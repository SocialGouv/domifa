import {
  Body,
  Controller,
  Delete,
  Get,
  HttpStatus,
  Post,
  Res,
  UseGuards,
} from "@nestjs/common";
import { AuthGuard } from "@nestjs/passport";
import { ApiBearerAuth, ApiTags } from "@nestjs/swagger";
import { Response } from "express";
import { AllowUserStructureRoles } from "../../auth/decorators";
import { CurrentUsager } from "../../auth/decorators/current-usager.decorator";
import { CurrentUser } from "../../auth/decorators/current-user.decorator";
import { AppUserGuard } from "../../auth/guards";
import { UsagerAccessGuard } from "../../auth/guards/usager-access.guard";
import { interactionRepository, usagerLightRepository } from "../../database";

import {
  ETAPE_ETAT_CIVIL,
  UsagerLight,
  UserStructureAuthenticated,
} from "../../_common/model";
import { DecisionDto } from "../dto";

import { UsagersService, usagerHistoryStateManager } from "../services";

@Controller("usagers-decision")
@ApiTags("usagers-decision")
@UseGuards(AuthGuard("jwt"), AppUserGuard)
@ApiBearerAuth()
export class UsagersDecisionController {
  constructor(private readonly usagersService: UsagersService) {}

  @UseGuards(UsagerAccessGuard)
  @AllowUserStructureRoles("simple", "responsable", "admin")
  @Post(":usagerRef")
  public async setDecision(
    @Body() decision: DecisionDto,
    @CurrentUser() user: UserStructureAuthenticated,
    @CurrentUsager() usager: UsagerLight
  ) {
    decision.userName = user.prenom + " " + user.nom;
    decision.userId = user.id;
    return await this.usagersService.setDecision(usager, decision);
  }

  @UseGuards(UsagerAccessGuard)
  @AllowUserStructureRoles("simple", "responsable", "admin")
  @Get("last-usagers-refs/:usagerRef")
  public async getLastUsagerIds(
    @CurrentUser() user: UserStructureAuthenticated,
    @CurrentUsager() usager: UsagerLight
  ) {
    return this.usagersService.getLastFiveCustomRef(
      user.structureId,
      usager.ref
    );
  }

  @UseGuards(UsagerAccessGuard)
  @AllowUserStructureRoles("simple", "responsable", "admin")
  @Get("renouvellement/:usagerRef")
  public async renouvellement(
    @CurrentUser() user: UserStructureAuthenticated,
    @CurrentUsager() usager: UsagerLight
  ) {
    return this.usagersService.renouvellement(usager, user);
  }

  @UseGuards(UsagerAccessGuard)
  @AllowUserStructureRoles("simple", "responsable", "admin")
  @Delete("renouvellement/:usagerRef")
  public async deleteRenew(
    @Res() res: Response,
    @CurrentUser() user: UserStructureAuthenticated,
    @CurrentUsager() usager: UsagerLight
  ) {
    if (
      typeof usager.historique.find(
        (decision) =>
          decision.statut === "REFUS" ||
          decision.statut === "RADIE" ||
          decision.statut === "VALIDE"
      ) === "undefined"
    ) {
      return res
        .status(HttpStatus.BAD_REQUEST)
        .json({ message: "CANNOT_DELETE_DECISION" });
    }

    usager.etapeDemande = ETAPE_ETAT_CIVIL;

    // On retire la précédente décision de l'historique
    usager.historique.splice(usager.historique.length - 1, 1);

    // On récupère la dernière décision
    usager.decision = usager.historique[usager.historique.length - 1];

    // on garde trace du changement dans l'historique, car il peut y avoir eu aussi d'autres changements entre temps
    await usagerHistoryStateManager.removeLastDecisionFromHistory({
      usager,
      createdBy: {
        userId: user.id,
        userName: user.prenom + " " + user.nom,
      },
      createdAt: usager.decision.dateDecision,
      historyBeginDate: usager.decision.dateDebut,
      removedDecisionUUID: usager.decision.uuid,
    });

    const lastInteractionOk = await interactionRepository.findLastInteractionOk(
      {
        user,
        usager,
        event: "create",
      }
    );

    // Si aucune interaction est trouvée, on remet la date de la décision actuelle
    usager.lastInteraction.dateInteraction = lastInteractionOk
      ? lastInteractionOk.dateInteraction
      : usager.decision.dateDebut
      ? usager.decision.dateDebut
      : // Cas extrême, aucune date définie
        usager.decision.dateDecision;

    const result = await usagerLightRepository.updateOne(
      { uuid: usager.uuid },
      {
        lastInteraction: usager.lastInteraction,
        historique: usager.historique,
        etapeDemande: usager.etapeDemande,
        decision: usager.decision,
      }
    );
    return res.status(HttpStatus.OK).json(result);
  }
}
