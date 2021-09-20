import {
  Body,
  Controller,
  Delete,
  Get,
  HttpException,
  HttpStatus,
  Param,
  Patch,
  Post,
  Res,
  UseGuards,
} from "@nestjs/common";
import { AuthGuard } from "@nestjs/passport";
import { ApiBearerAuth, ApiTags } from "@nestjs/swagger";
import { Response } from "express";
import { CurrentUsager } from "../../auth/current-usager.decorator";
import { CurrentUser } from "../../auth/current-user.decorator";
import { AllowUserStructureRoles, AppUserGuard } from "../../auth/guards";
import { UsagerAccessGuard } from "../../auth/guards/usager-access.guard";
import { usagerLightRepository, usagerRepository } from "../../database";
import {
  ETAPE_DOCUMENTS,
  ETAPE_ETAT_CIVIL,
  ETAPE_RENDEZ_VOUS,
  UsagerLight,
  UserStructureAuthenticated,
  USER_STRUCTURE_ROLE_ALL,
} from "../../_common/model";
import { CreateUsagerDto } from "../dto/create-usager.dto";
import { DecisionDto } from "../dto/decision.dto";
import { EditUsagerDto } from "../dto/edit-usager.dto";
import { EntretienDto } from "../dto/entretien.dto";
import { PreferenceContactDto } from "../dto/preferenceContact.dto";
import { ProcurationDto } from "../dto/procuration.dto";
import { TransfertDto } from "../dto/transfert.dto";
import { CerfaService } from "../services/cerfa.service";
import { usagerDeletor } from "../services/usagerDeletor.service";
import { usagerHistoryStateManager } from "../services/usagerHistoryStateManager.service";
import { UsagersService } from "../services/usagers.service";

@Controller("usagers")
@ApiTags("usagers")
@UseGuards(AuthGuard("jwt"), AppUserGuard)
@ApiBearerAuth()
export class UsagersController {
  constructor(
    private readonly usagersService: UsagersService,
    private readonly cerfaService: CerfaService
  ) {}

  @Get()
  @AllowUserStructureRoles(...USER_STRUCTURE_ROLE_ALL)
  public async findAllByStructure(
    @CurrentUser() user: UserStructureAuthenticated
  ) {
    return usagerLightRepository.findMany(
      {
        structureId: user.structureId,
      },
      {}
    );
  }

  /* FORMULAIRE INFOS */
  @AllowUserStructureRoles("simple", "responsable", "admin")
  @Post()
  public postUsager(
    @Body() usagerDto: CreateUsagerDto,
    @CurrentUser() user: UserStructureAuthenticated
  ) {
    return this.usagersService.create(usagerDto, user);
  }

  @UseGuards(UsagerAccessGuard)
  @AllowUserStructureRoles("simple", "responsable", "admin")
  @Patch(":usagerRef")
  public async patchUsager(
    @Body() usagerDto: EditUsagerDto,
    @CurrentUser() user: UserStructureAuthenticated,
    @CurrentUsager() usager: UsagerLight
  ) {
    if (
      usagerDto.typeDom === "RENOUVELLEMENT" ||
      usagerDto.etapeDemande === ETAPE_ETAT_CIVIL
    ) {
      usagerDto.etapeDemande = ETAPE_RENDEZ_VOUS;
    }

    if (!usagerDto.langue || usagerDto.langue === "") {
      usagerDto.langue = null;
    }

    if (!usager.customRef && !usagerDto.customRef) {
      usagerDto.customRef = usager.ref.toString();
    }

    usager = await this.usagersService.patch({ uuid: usager.uuid }, usagerDto);

    await usagerHistoryStateManager.updateHistoryStateWithoutDecision({
      usager,
      createdBy: {
        userId: user.id,
        userName: user.prenom + " " + user.nom,
      },
      createdEvent: "update-usager",
    });

    return usager;
  }

  @UseGuards(UsagerAccessGuard)
  @AllowUserStructureRoles("simple", "responsable", "admin")
  @Post("entretien/:usagerRef")
  public async setEntretien(
    @Body() entretien: EntretienDto,
    @CurrentUser() user: UserStructureAuthenticated,
    @CurrentUsager() currentUsager: UsagerLight
  ) {
    const usager = await usagerLightRepository.updateOne(
      { uuid: currentUsager.uuid },
      {
        entretien,
        etapeDemande: ETAPE_DOCUMENTS,
      }
    );

    await usagerHistoryStateManager.updateHistoryStateWithoutDecision({
      usager,
      createdBy: {
        userId: user.id,
        userName: user.prenom + " " + user.nom,
      },
      createdEvent: "update-entretien",
    });

    return usager;
  }

  @UseGuards(UsagerAccessGuard)
  @AllowUserStructureRoles("simple", "responsable", "admin")
  @Get("next-step/:usagerRef/:etapeDemande")
  public async nextStep(
    @Param("etapeDemande") etapeDemande: number,
    @CurrentUsager() usager: UsagerLight
  ) {
    return this.usagersService.nextStep({ uuid: usager.uuid }, etapeDemande);
  }

  @UseGuards(UsagerAccessGuard)
  @AllowUserStructureRoles(...USER_STRUCTURE_ROLE_ALL)
  @Get("stop-courrier/:usagerRef")
  public async stopCourrier(@CurrentUsager() currentUsager: UsagerLight) {
    const usager = await usagerRepository.findOne({
      uuid: currentUsager.uuid,
    });
    if (usager.options.npai.actif) {
      usager.options.npai.actif = false;
      usager.options.npai.dateDebut = null;
    } else {
      usager.options.npai.actif = true;
      usager.options.npai.dateDebut = new Date();
    }

    return this.usagersService.patch(
      { uuid: usager.uuid },
      { options: usager.options }
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
  @Post("decision/:usagerRef")
  public async setDecision(
    @Body() decision: DecisionDto,
    @CurrentUser() user: UserStructureAuthenticated,
    @CurrentUsager() usager: UsagerLight
  ) {
    decision.userName = user.prenom + " " + user.nom;
    decision.userId = user.id;
    return this.usagersService.setDecision({ uuid: usager.uuid }, decision);
  }

  @AllowUserStructureRoles("simple", "responsable", "admin")
  @Get("doublon/:nom/:prenom/:usagerRef")
  public async isDoublon(
    @Param("nom") nom: string,
    @Param("prenom") prenom: string,
    @Param("usagerRef") ref: number,
    @CurrentUser() user: UserStructureAuthenticated
  ): Promise<UsagerLight[]> {
    const doublons = await usagerLightRepository.findDoublons({
      nom,
      prenom,
      ref,
      structureId: user.structureId,
    });
    return doublons;
  }

  @UseGuards(AuthGuard("jwt"), AppUserGuard, UsagerAccessGuard)
  @AllowUserStructureRoles("responsable", "admin")
  @Delete(":usagerRef")
  public async delete(
    @CurrentUser() user: UserStructureAuthenticated,
    @CurrentUsager() usager: UsagerLight,
    @Res() res: Response
  ) {
    await usagerDeletor.deleteUsager({
      usagerRef: usager.ref,
      structureId: user.structureId,
    });

    return res.status(HttpStatus.OK).json({ message: "DELETE_SUCCESS" });
  }

  @UseGuards(UsagerAccessGuard)
  @AllowUserStructureRoles("simple", "responsable", "admin")
  @Post("transfert/:usagerRef")
  public async editTransfert(
    @Body() transfertDto: TransfertDto,
    @CurrentUser() user: UserStructureAuthenticated,
    @CurrentUsager() usager: UsagerLight
  ) {
    const action = usager.options.transfert.actif ? "EDIT" : "CREATION";

    const newTransfert = {
      actif: true,
      adresse: transfertDto.adresse,
      dateDebut: new Date(transfertDto.dateDebut),
      dateFin: new Date(transfertDto.dateFin),
      nom: transfertDto.nom,
    };

    usager.options.historique.transfert.push({
      user: user.prenom + " " + user.nom,
      action,
      date: new Date(),
      content: newTransfert,
    });

    usager.options.transfert = newTransfert;

    return this.usagersService.patch(
      { uuid: usager.uuid },
      { options: usager.options }
    );
  }

  @UseGuards(UsagerAccessGuard)
  @AllowUserStructureRoles("simple", "responsable", "admin")
  @Post("preference/:usagerRef")
  public async editPreference(
    @Body() preferenceDto: PreferenceContactDto,
    @CurrentUsager() usager: UsagerLight
  ) {
    // TODO: check phone
    usager.preference = preferenceDto;
    // Nettoyage du téléphone
    if (!preferenceDto.phone) {
      preferenceDto.phoneNumber = null;
    }
    return this.usagersService.patch(
      { uuid: usager.uuid },
      { preference: usager.preference }
    );
  }

  @UseGuards(UsagerAccessGuard)
  @AllowUserStructureRoles("simple", "responsable", "admin")
  @Delete("renouvellement/:usagerRef")
  public async deleteRenew(
    @Res() res: Response,
    @CurrentUser() user: UserStructureAuthenticated,
    @CurrentUsager() usager: UsagerLight
  ) {
    if (usager.typeDom === "RENOUVELLEMENT") {
      usager.etapeDemande = ETAPE_ETAT_CIVIL;

      const [decisionToRollback] = usager.historique.splice(
        usager.historique.length - 1,
        1
      );

      usager.decision = usager.historique[usager.historique.length - 1];

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

  @UseGuards(UsagerAccessGuard)
  @AllowUserStructureRoles("simple", "responsable", "admin")
  @Delete("transfert/:usagerRef")
  public async deleteTransfert(
    @CurrentUser() user: UserStructureAuthenticated,
    @CurrentUsager() usager: UsagerLight
  ) {
    usager.options.transfert = {
      actif: false,
      adresse: "",
      nom: "",
      dateDebut: null,
      dateFin: null,
    };

    usager.options.historique.transfert.push({
      user: user.prenom + " " + user.nom,
      action: "DELETE",
      date: new Date(),
      content: {},
    });

    return this.usagersService.patch(
      { uuid: usager.uuid },
      { options: usager.options }
    );
  }

  @UseGuards(UsagerAccessGuard)
  @AllowUserStructureRoles("simple", "responsable", "admin")
  @Post("procuration/:usagerRef")
  public async editProcuration(
    @Body() procurationDto: ProcurationDto,
    @CurrentUser() user: UserStructureAuthenticated,
    @CurrentUsager() usager: UsagerLight
  ) {
    const action = usager.options.procuration.actif ? "EDIT" : "CREATION";
    const newProcuration = {
      actif: true,
      dateFin: new Date(procurationDto.dateFin),
      dateDebut: new Date(procurationDto.dateDebut),
      dateNaissance: procurationDto.dateNaissance,
      nom: procurationDto.nom,
      prenom: procurationDto.prenom,
    };

    usager.options.historique.procuration.push({
      user: user.prenom + " " + user.nom,
      action,
      date: new Date(),
      content: newProcuration,
    });

    usager.options.procuration = newProcuration;
    return this.usagersService.patch(
      { uuid: usager.uuid },
      { options: usager.options }
    );
  }

  @UseGuards(UsagerAccessGuard)
  @AllowUserStructureRoles("simple", "responsable", "admin")
  @Delete("procuration/:usagerRef")
  public async deleteProcuration(
    @CurrentUser() user: UserStructureAuthenticated,
    @CurrentUsager() usager: UsagerLight
  ) {
    usager.options.procuration = {
      actif: false,
      dateDebut: null,
      dateFin: null,
      dateNaissance: "null",
      nom: "",
      prenom: "",
    };

    usager.options.historique.procuration.push({
      user: user.prenom + " " + user.nom,
      action: "DELETE",
      date: new Date(),
      content: {},
    });

    return this.usagersService.patch(
      { uuid: usager.uuid },
      { options: usager.options }
    );
  }

  @UseGuards(UsagerAccessGuard)
  @AllowUserStructureRoles(...USER_STRUCTURE_ROLE_ALL)
  @Get("attestation/:usagerRef")
  public async getAttestation(
    @Res() res: Response,
    @CurrentUser() user: UserStructureAuthenticated,
    @CurrentUsager() currentUsager: UsagerLight
  ) {
    const usager = await usagerRepository.findOne({ uuid: currentUsager.uuid });

    return this.cerfaService
      .attestation(usager, user)
      .then((buffer) => {
        res.setHeader("content-type", "application/pdf");
        res.send(buffer);
      })
      .catch((err) => {
        throw new HttpException(
          {
            err,
            message: "CERFA_ERROR",
          },
          HttpStatus.INTERNAL_SERVER_ERROR
        );
      });
  }

  @UseGuards(UsagerAccessGuard)
  @AllowUserStructureRoles(...USER_STRUCTURE_ROLE_ALL)
  @Get(":usagerRef")
  public async findOne(@CurrentUsager() usager: UsagerLight) {
    return usager;
  }
}
