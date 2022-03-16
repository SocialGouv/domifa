import { usagerOptionsHistoryRepository } from "./../../database/services/usager/usagerOptionsHistoryRepository.service";
import { messageSmsRepository } from "./../../database/services/message-sms/messageSmsRepository.service";
import {
  Body,
  Controller,
  Delete,
  Get,
  HttpStatus,
  Param,
  Patch,
  Post,
  Query,
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
import {
  interactionRepository,
  PgRepositoryFindOrder,
  usagerHistoryRepository,
  usagerLightRepository,
  usagerRepository,
  userUsagerRepository,
  userUsagerSecurityRepository,
} from "../../database";
import { USAGER_LIGHT_ATTRIBUTES } from "../../database/services/usager/USAGER_LIGHT_ATTRIBUTES.const";
import { userUsagerCreator, userUsagerUpdator } from "../../users/services";
import { appLogger } from "../../util";
import { dataCompare } from "../../util/dataCompare.service";
import {
  CerfaDocType,
  ETAPE_DOCUMENTS,
  UsagerLight,
  UserStructureAuthenticated,
  USER_STRUCTURE_ROLE_ALL,
} from "../../_common/model";
import {
  CreateUsagerDto,
  EntretienDto,
  PreferenceContactDto,
  UpdatePortailUsagerOptionsDto,
} from "../dto";
import { SearchUsagerDto } from "../dto/search-usager.dto";
import {
  CerfaService,
  deleteUsagerFolder,
  usagerHistoryStateManager,
  UsagersService,
} from "../services";
import { AppLogsService } from "../../modules/app-logs/app-logs.service";
import { generateCerfaDatas } from "../cerfa";

@Controller("usagers")
@ApiTags("usagers")
@UseGuards(AuthGuard("jwt"), AppUserGuard)
@ApiBearerAuth()
export class UsagersController {
  constructor(
    private readonly usagersService: UsagersService,
    private readonly cerfaService: CerfaService,
    private appLogsService: AppLogsService
  ) {}

  @Get()
  @AllowUserStructureRoles(...USER_STRUCTURE_ROLE_ALL)
  public async findAllByStructure(
    @Query("chargerTousRadies") chargerTousRadiesString: string,
    @CurrentUser() user: UserStructureAuthenticated
  ) {
    const chargerTousRadies = chargerTousRadiesString?.toLowerCase() === "true";
    const usagersNonRadies = await usagerLightRepository.findManyWithQuery({
      select: USAGER_LIGHT_ATTRIBUTES,
      where: `"structureId" = :structureId
        and "decision"->>'statut' <> :statut`,
      params: {
        statut: "RADIE",
        structureId: user.structureId,
      },
    });
    const orderByLastDecisionDesc: PgRepositoryFindOrder<any> = {};
    orderByLastDecisionDesc[`"decision"->>'dateFin'`] = "DESC";

    const usagersRadiesFirsts = await usagerLightRepository.findManyWithQuery({
      select: USAGER_LIGHT_ATTRIBUTES,
      where: `"structureId" = :structureId
        and "decision"->>'statut' = :statut`,
      params: {
        statut: "RADIE",
        structureId: user.structureId,
      },
      maxResults: chargerTousRadies ? undefined : 50,
      order: orderByLastDecisionDesc,
    });

    const usagersRadiesTotalCount = chargerTousRadies
      ? usagersRadiesFirsts.length
      : await usagerLightRepository.count({
          where: `"structureId" = :structureId
        and "decision"->>'statut' = :statut`,
          params: {
            statut: "RADIE",
            structureId: user.structureId,
          },
        });
    return {
      usagersNonRadies,
      usagersRadiesFirsts,
      usagersRadiesTotalCount,
    };
  }
  @Post("search-radies")
  @AllowUserStructureRoles(...USER_STRUCTURE_ROLE_ALL)
  public async searchInRadies(
    @Body() { searchString }: SearchUsagerDto,
    @CurrentUser() user: UserStructureAuthenticated
  ) {
    if (!searchString || searchString.trim().length < 3) {
      return [];
    }
    const orderByLastDecisionDesc: PgRepositoryFindOrder<any> = {};
    orderByLastDecisionDesc[`"decision"->>'dateFin'`] = "DESC";

    const search = dataCompare.cleanString(searchString);
    const usagersRadies = await usagerLightRepository.findManyWithQuery({
      select: USAGER_LIGHT_ATTRIBUTES,
      where: `"structureId" = :structureId
        and "decision"->>'statut' = :statut
        and LOWER(coalesce("nom", '') || ' ' || coalesce("prenom", '')) LIKE :search`,
      params: {
        statut: "RADIE",
        structureId: user.structureId,
        search: `%${search}%`,
      },
      maxResults: 10,
      order: orderByLastDecisionDesc,
    });

    return usagersRadies;
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
    @Body() usagerDto: CreateUsagerDto,
    @CurrentUser() user: UserStructureAuthenticated,
    @CurrentUsager() usager: UsagerLight
  ) {
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
    // On vérifie s'il existe un user associé
    const userUsager = await userUsagerRepository.findOne({
      usagerUUID: usager.uuid,
    });

    if (userUsager) {
      // Users
      await userUsagerSecurityRepository.deleteByCriteria({
        userId: userUsager.id,
        structureId: userUsager.structureId,
      });

      // Users
      await userUsagerRepository.deleteByCriteria({
        uuid: userUsager.uuid,
      });
    }

    // Historique
    await usagerHistoryRepository.deleteByCriteria({
      usagerRef: usager.ref,
      structureId: user.structureId,
    });

    // Historique de la procuration
    await usagerOptionsHistoryRepository.deleteByCriteria({
      usagerUUID: usager.uuid,
    });

    // Interactions
    await interactionRepository.deleteByCriteria({
      usagerRef: usager.ref,
      structureId: user.structureId,
    });

    // Suppression des SMS
    await messageSmsRepository.deleteByCriteria({
      usagerRef: usager.ref,
      structureId: user.structureId,
    });

    // Suppression des fichiers de l'usager
    deleteUsagerFolder({
      usagerRef: usager.ref,
      structureId: user.structureId,
    });

    // Suppression de l'usager
    await usagerRepository.deleteByCriteria({
      ref: usager.ref,
      structureId: user.structureId,
    });

    // Ajout d'un log
    await this.appLogsService.create({
      userId: user.id,
      usagerRef: usager.ref,
      structureId: user.structureId,
      action: "SUPPRIMER_DOMICILIE",
    });
    return res.status(HttpStatus.OK).json({ message: "DELETE_SUCCESS" });
  }

  @UseGuards(UsagerAccessGuard)
  @AllowUserStructureRoles("simple", "responsable", "admin")
  @Post("preference/:usagerRef")
  public async editPreference(
    @Body() preferenceDto: PreferenceContactDto,
    @CurrentUsager() usager: UsagerLight
  ) {
    // Nettoyage du téléphone
    if (!preferenceDto.phone) {
      preferenceDto.phoneNumber = null;
    }

    return this.usagersService.patch(
      { uuid: usager.uuid },
      { preference: preferenceDto }
    );
  }

  @UseGuards(UsagerAccessGuard)
  @AllowUserStructureRoles("simple", "responsable", "admin")
  @Post("portail-usager/options/:usagerRef")
  public async editPreupdatePortailUsagerOptionsference(
    @Res() res: Response,
    @Body() dto: UpdatePortailUsagerOptionsDto,
    @CurrentUsager() usager: UsagerLight,
    @CurrentUser() user: UserStructureAuthenticated
  ) {
    try {
      usager.options.portailUsagerEnabled = dto.portailUsagerEnabled;
      const updatedUsager = await this.usagersService.patch(
        { uuid: usager.uuid },
        { options: usager.options }
      );
      if (usager.options.portailUsagerEnabled) {
        const userUsager = await userUsagerRepository.findOne({
          usagerUUID: usager.uuid,
        });
        if (!userUsager) {
          const { login, temporaryPassword } =
            await userUsagerCreator.createUserWithTmpPassword(
              {
                usagerUUID: usager.uuid,
                structureId: usager.structureId,
              },
              { creator: user }
            );
          return res
            .status(HttpStatus.CREATED)
            .json({ usager: updatedUsager, login, temporaryPassword });
        } else {
          const generateNewPassword =
            dto.portailUsagerEnabled && dto.generateNewPassword;
          const { userUsager, temporaryPassword } =
            await userUsagerUpdator.enableUser({
              usagerUUID: usager.uuid,
              generateNewPassword,
            });
          await this.appLogsService.create({
            userId: user.id,
            usagerRef: usager.ref,
            structureId: user.structureId,
            action: "RESET_PASSWORD_PORTAIL",
          });
          return res.status(HttpStatus.CREATED).json({
            usager: updatedUsager,
            login: generateNewPassword ? userUsager.login : undefined,
            temporaryPassword,
          });
        }
      } else {
        // disable login
        await userUsagerUpdator.disableUser({ usagerUUID: usager.uuid });
      }
      return res.status(HttpStatus.OK).json({ usager: updatedUsager });
    } catch (err) {
      appLogger.error("Error updating usager options", {
        error: err as any,
        sentry: true,
      });
      return res
        .status(HttpStatus.INTERNAL_SERVER_ERROR)
        .json({ message: "ERROR_UPDATING_OPTIONS" });
    }
  }

  @UseGuards(UsagerAccessGuard)
  @AllowUserStructureRoles(...USER_STRUCTURE_ROLE_ALL)
  @Get("attestation/:usagerRef/:typeCerfa")
  public async getAttestation(
    @Param("typeCerfa") typeCerfa: CerfaDocType,
    @Res() res: Response,
    @CurrentUser() user: UserStructureAuthenticated,
    @CurrentUsager() currentUsager: UsagerLight
  ) {
    const usager = await usagerRepository.findOne({ uuid: currentUsager.uuid });

    try {
      const buffer = await this.cerfaService.attestation(
        usager,
        user,
        typeCerfa
      );
      res.setHeader("content-type", "application/pdf");
      return res.send(buffer);
    } catch (err) {
      console.error(err);
      const pdfInfos = generateCerfaDatas(usager, user, typeCerfa);
      console.error(pdfInfos);
      appLogger.error(
        `CERFA ERROR structure : ${user.structureId} / usager :${usager.ref} `,
        {
          sentry: true,
          extra: {
            ...pdfInfos,
          },
        }
      );
      return res
        .status(HttpStatus.INTERNAL_SERVER_ERROR)
        .json({ message: "CERFA_ERROR" });
    }
  }

  @UseGuards(UsagerAccessGuard)
  @AllowUserStructureRoles(...USER_STRUCTURE_ROLE_ALL)
  @Get(":usagerRef")
  public async findOne(@CurrentUsager() usager: UsagerLight) {
    return usager;
  }
}
