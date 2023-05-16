import { UsagerNote } from "./../../_common/model/usager/UsagerNote.type";
import { ETAPE_DECISION } from "../../_common/model/usager/_constants/ETAPES_DEMANDE.const";
import { usagerRepository } from "../../database/services/usager/usagerRepository.service";
import {
  Body,
  Controller,
  Delete,
  Get,
  HttpStatus,
  Param,
  ParseIntPipe,
  Post,
  Res,
  UseGuards,
} from "@nestjs/common";
import { AuthGuard } from "@nestjs/passport";
import { ApiBearerAuth, ApiTags } from "@nestjs/swagger";
import { Response } from "express";

import { interactionRepository, usagerNotesRepository } from "../../database";

import {
  ETAPE_ETAT_CIVIL,
  Usager,
  UserStructureAuthenticated,
} from "../../_common/model";
import { CheckDuplicateUsagerRefDto, DecisionDto } from "../dto";
import {
  UsagersService,
  usagerHistoryStateManager,
  generateNoteForDecision,
} from "../services";
import {
  AllowUserStructureRoles,
  CurrentUser,
  CurrentUsager,
} from "../../auth/decorators";
import { AppUserGuard, UsagerAccessGuard } from "../../auth/guards";
import { Not } from "typeorm";

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
    @CurrentUsager() usager: Usager,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    @Param("usagerRef", new ParseIntPipe()) _usagerRef: number
  ): Promise<Usager> {
    decision.userName = user.prenom + " " + user.nom;
    decision.userId = user.id;
    return this.usagersService.setDecision(usager, decision);
  }

  @UseGuards(UsagerAccessGuard)
  @AllowUserStructureRoles("simple", "responsable", "admin")
  @Get("last-usagers-refs/:usagerRef")
  public async getLastUsagerIds(
    @CurrentUser() user: UserStructureAuthenticated,
    @CurrentUsager() usager: Usager,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    @Param("usagerRef", new ParseIntPipe()) _usagerRef: number
  ) {
    return usagerRepository.findLastFiveCustomRef({
      structureId: user.structureId,
      usagerRef: usager.ref,
    });
  }

  @UseGuards(UsagerAccessGuard)
  @AllowUserStructureRoles("simple", "responsable", "admin")
  @Get("renouvellement/:usagerRef")
  public async renouvellement(
    @CurrentUser() user: UserStructureAuthenticated,
    @CurrentUsager() usager: Usager,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    @Param("usagerRef", new ParseIntPipe()) _usagerRef: number
  ): Promise<Usager> {
    return this.usagersService.renouvellement(usager, user);
  }

  @UseGuards(UsagerAccessGuard)
  @AllowUserStructureRoles("responsable", "admin")
  @Post("check-duplicates-custom-ref/:usagerRef")
  public async checkDuplicatesUsagerRef(
    @Body() duplicateUsagerRefDto: CheckDuplicateUsagerRefDto,
    @CurrentUsager() usager: Usager,
    @CurrentUser() user: UserStructureAuthenticated,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    @Param("usagerRef", new ParseIntPipe()) _usagerRef: number
  ): Promise<Usager[]> {
    return usagerRepository.find({
      where: {
        structureId: user.structureId,
        ref: Not(usager.ref),
        customRef: duplicateUsagerRefDto.customRef,
      },
      select: ["nom", "prenom", "ref", "customRef", "dateNaissance"],
    });
  }

  @UseGuards(UsagerAccessGuard)
  @AllowUserStructureRoles("responsable", "admin")
  @Delete(":usagerRef")
  public async deleteLastDecision(
    @Res() res: Response,
    @CurrentUser() user: UserStructureAuthenticated,
    @CurrentUsager() usager: Usager,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    @Param("usagerRef", new ParseIntPipe()) _usagerRef: number
  ) {
    if (usager.historique.length <= 1) {
      return res
        .status(HttpStatus.BAD_REQUEST)
        .json({ message: "CANNOT_DELETE_DECISION" });
    }

    await usagerHistoryStateManager.removeLastDecisionFromHistory({
      usager,
      removedDecisionUUID: usager.decision.uuid,
    });

    usager.etapeDemande =
      usager.decision.statut === "INSTRUCTION"
        ? ETAPE_ETAT_CIVIL
        : ETAPE_DECISION;

    const deletedDecision = usager.historique[usager.historique.length - 1];

    // On retire la précédente décision de l'historique
    usager.historique.splice(usager.historique.length - 1, 1);

    // On récupère la dernière décision
    usager.decision = usager.historique[usager.historique.length - 1];

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

    const createdBy = {
      userId: user.id,
      userName: user.prenom + " " + user.nom,
    };

    const newNote: Partial<UsagerNote> = {
      message: generateNoteForDecision(deletedDecision),
      usagerUUID: usager.uuid,
      usagerRef: usager.ref,
      structureId: usager.structureId,
      createdBy,
      archived: false,
    };

    await usagerNotesRepository.save(newNote);

    const result = await usagerRepository.updateOneAndReturn(usager.uuid, {
      lastInteraction: usager.lastInteraction,
      historique: usager.historique,
      etapeDemande: usager.etapeDemande,
      decision: usager.decision,
    });

    return res.status(HttpStatus.OK).json(result);
  }
}
