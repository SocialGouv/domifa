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

import { usagerNotesRepository, usagerRepository } from "../../database";

import { UserStructureAuthenticated } from "../../_common/model";
import { CheckDuplicateUsagerRefDto, DecisionDto } from "../dto";
import { UsagerHistoryStateService, UsagersService } from "../services";
import {
  AllowUserStructureRoles,
  CurrentUser,
  CurrentUsager,
  AllowUserProfiles,
} from "../../auth/decorators";
import { AppUserGuard, UsagerAccessGuard } from "../../auth/guards";
import { Not } from "typeorm";
import {
  ETAPE_ETAT_CIVIL,
  ETAPE_DECISION,
  USAGER_DECISION_STATUT_LABELS_PROFIL,
  UsagerDecision,
  UsagerNote,
  Usager,
} from "@domifa/common";
import { format } from "date-fns";
import { getLastInteractionOut } from "../../modules/interactions/services";

@Controller("usagers-decision")
@ApiTags("usagers-decision")
@UseGuards(AuthGuard("jwt"), AppUserGuard)
@AllowUserStructureRoles("simple", "responsable", "admin")
@AllowUserProfiles("structure")
@ApiBearerAuth()
export class UsagersDecisionController {
  constructor(
    private readonly usagersService: UsagersService,
    private readonly usagerHistoryStateService: UsagerHistoryStateService
  ) {}

  @UseGuards(UsagerAccessGuard)
  @Post(":usagerRef")
  public async setDecision(
    @Body() decision: DecisionDto,
    @CurrentUser() user: UserStructureAuthenticated,
    @CurrentUsager() usager: Usager,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    @Param("usagerRef", new ParseIntPipe()) _usagerRef: number
  ): Promise<Usager> {
    if (
      !["ATTENTE_DECISION", "INSTRUCTION"].includes(decision.statut) &&
      !["reposable", "admmin"].includes(user.role)
    ) {
      throw new Error("CANNOT_SET_DECISION");
    }

    decision.userName = `${user.prenom} ${user.nom}`;
    decision.userId = user.id;

    return await this.usagersService.setDecision(usager, decision);
  }

  @UseGuards(UsagerAccessGuard)
  @AllowUserStructureRoles("responsable", "admin")
  @Get("last-usagers-refs/:usagerRef")
  public async getLastUsagerIds(
    @CurrentUser() user: UserStructureAuthenticated,
    @CurrentUsager() usager: Usager,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    @Param("usagerRef", new ParseIntPipe()) _usagerRef: number
  ) {
    return await usagerRepository.findLastFiveCustomRef({
      structureId: user.structureId,
      usagerRef: usager.ref,
    });
  }

  @UseGuards(UsagerAccessGuard)
  @Get("renouvellement/:usagerRef")
  @AllowUserStructureRoles("responsable", "admin", "simple")
  public async renouvellement(
    @CurrentUser() user: UserStructureAuthenticated,
    @CurrentUsager() usager: Usager,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    @Param("usagerRef", new ParseIntPipe()) _usagerRef: number
  ): Promise<Usager> {
    return await this.usagersService.renouvellement(usager, user);
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
    return await usagerRepository.find({
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
    if (usager?.historique?.length <= 1) {
      return res
        .status(HttpStatus.BAD_REQUEST)
        .json({ message: "CANNOT_DELETE_DECISION" });
    }

    await this.usagerHistoryStateService.deleteHistoryState(usager);

    usager.etapeDemande =
      usager.decision.statut === "INSTRUCTION"
        ? ETAPE_ETAT_CIVIL
        : ETAPE_DECISION;

    const deletedDecision = usager.historique[usager.historique.length - 1];

    // On retire la précédente décision de l'historique
    usager.historique.splice(usager.historique.length - 1, 1);

    // On récupère la dernière décision
    usager.decision = usager.historique[usager.historique.length - 1];
    usager.statut = usager.decision.statut;
    usager.options.npai = {
      actif: false,
      dateDebut: null,
    };

    usager.lastInteraction.dateInteraction = await getLastInteractionOut(
      usager,
      user.structure
    );

    const createdBy = {
      userId: user.id,
      userName: `${user.prenom} ${user.nom}`,
    };

    const newNote: Partial<UsagerNote> = {
      message: this.generateNoteForDecision(deletedDecision),
      usagerUUID: usager.uuid,
      usagerRef: usager.ref,
      structureId: usager.structureId,
      createdBy,
      archived: false,
    };

    await usagerNotesRepository.save(newNote);
    await usagerRepository.update(
      { uuid: usager.uuid },
      {
        updatedAt: new Date(),
        lastInteraction: usager.lastInteraction,
        historique: usager.historique,
        etapeDemande: usager.etapeDemande,
        decision: usager.decision,
        statut: usager.decision.statut,
        options: usager.options,
      }
    );

    return res.status(HttpStatus.OK).json(usager);
  }

  private readonly generateNoteForDecision = (
    decision: UsagerDecision
  ): string => {
    let strDecision = `Suppression de la décision : \n ${
      USAGER_DECISION_STATUT_LABELS_PROFIL[decision.statut]
    }`;

    const dateRef = decision?.dateDebut
      ? decision.dateDebut
      : decision.dateDecision;

    const dateDebut = format(new Date(dateRef), "dd/MM/yyyy");

    if (decision.statut === "VALIDE") {
      const dateFin = format(new Date(decision.dateFin), "dd/MM/yyyy");
      strDecision = `${strDecision} du ${dateDebut} au ${dateFin}\n`;
    } else {
      strDecision = `${strDecision} le ${dateDebut}\n`;
    }
    return strDecision;
  };
}
