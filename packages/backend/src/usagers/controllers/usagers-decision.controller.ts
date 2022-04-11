import { UsagerDecision } from "./../../_common/model/usager/UsagerDecision.type";
import { usagerHistoryRepository } from "./../../database/services/usager/usagerHistoryRepository.service";
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
import { usagerLightRepository } from "../../database";

import {
  ETAPE_ETAT_CIVIL,
  UsagerHistoryState,
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
    return await this.usagersService.setDecision(
      { uuid: usager.uuid },
      decision
    );
  }

  @UseGuards(UsagerAccessGuard)
  @AllowUserStructureRoles("simple", "responsable", "admin")
  @Get("historique/:usagerRef")
  public async getHistorique(
    @CurrentUser() user: UserStructureAuthenticated,
    @CurrentUsager() usager: UsagerLight
  ) {
    console.log("historique");
    const historique = await usagerHistoryRepository.findOne({
      usagerUUID: usager.uuid,
    });

    return historique.states.filter(
      (state) =>
        state.createdEvent === "new-decision" ||
        state.createdEvent === "delete-decision"
    );
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
    const hasHistorique =
      typeof usager.historique.find(
        (decision) =>
          decision.statut === "REFUS" ||
          decision.statut === "RADIE" ||
          decision.statut === "VALIDE"
      ) !== "undefined";

    if (hasHistorique) {
      usager.etapeDemande = ETAPE_ETAT_CIVIL;

      // Fix temporaire = si instruction dans l'historique, on prend la valeure juste avant
      const index =
        usager.historique[usager.historique.length - 1].statut === "INSTRUCTION"
          ? 1
          : 2;

      usager.historique.splice(usager.historique.length - index, index);

      const decisionToRollback =
        usager.historique[usager.historique.length - 1];

      usager.decision = decisionToRollback;

      if (decisionToRollback) {
        // on garde trace du changement dans l'historique, car il peut y avoir eu aussi d'autres changements entre temps
        await usagerHistoryStateManager.removeLastDecisionFromHistory({
          usager,
          createdBy: {
            userId: user.id,
            userName: user.prenom + " " + user.nom,
          },
          createdAt: usager.decision.dateDecision,
          historyBeginDate: usager.decision.dateDebut,
          removedDecisionUUID: decisionToRollback.uuid,
        });
      }

      const result = await usagerLightRepository.updateOne(
        { uuid: usager.uuid },
        {
          historique: usager.historique,
          etapeDemande: usager.etapeDemande,
          decision: usager.decision,
        }
      );
      return res.status(HttpStatus.OK).json(result);
    } else {
      return res
        .status(HttpStatus.BAD_REQUEST)
        .json({ message: "CANNOT_DELETE_DECISION" });
    }
  }
}
