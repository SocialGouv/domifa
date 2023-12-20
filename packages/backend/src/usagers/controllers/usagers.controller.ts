import { usagerEntretienRepository } from "./../../database/services/usager/usagerEntretienRepository.service";
import { usagerDocsRepository } from "./../../database/services/usager/usagerDocsRepository.service";

import { messageSmsRepository } from "./../../database/services/message-sms/messageSmsRepository.service";
import {
  Body,
  Controller,
  Delete,
  Get,
  HttpStatus,
  Param,
  ParseBoolPipe,
  ParseIntPipe,
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
  usagerRepository,
  USAGER_LIGHT_ATTRIBUTES,
  userUsagerRepository,
  joinSelectFields,
} from "../../database";

import { userUsagerCreator, userUsagerUpdator } from "../../users/services";
import { appLogger } from "../../util";
import { dataCompare } from "../../util/dataCompare.service";
import {
  Usager,
  UserStructureAuthenticated,
  USER_STRUCTURE_ROLE_ALL,
} from "../../_common/model";
import {
  CheckDuplicateUsagerDto,
  CreateUsagerDto,
  EntretienDto,
  UpdatePortailUsagerOptionsDto,
} from "../dto";
import { SearchUsagerDto } from "../dto/search-usager.dto";
import {
  deleteUsagerFolder,
  usagerHistoryStateManager,
  UsagersService,
} from "../services";
import { AppLogsService } from "../../modules/app-logs/app-logs.service";
import { generateCerfaData } from "../services/cerfa";

import pdftk = require("node-pdftk");

import { resolve } from "path";
import { readFile } from "fs-extra";
import { ExpressResponse } from "../../util/express";
import { ETAPE_DOCUMENTS, CerfaDocType } from "@domifa/common";

@Controller("usagers")
@ApiTags("usagers")
@UseGuards(AuthGuard("jwt"), AppUserGuard)
@ApiBearerAuth()
export class UsagersController {
  constructor(
    private readonly usagersService: UsagersService,
    private readonly appLogsService: AppLogsService
  ) {}

  @Get()
  @AllowUserStructureRoles(...USER_STRUCTURE_ROLE_ALL)
  public async findAllByStructure(
    @Query("chargerTousRadies", new ParseBoolPipe())
    chargerTousRadies: boolean,
    @CurrentUser() user: UserStructureAuthenticated
  ) {
    const usagersNonRadies = await usagerRepository
      .createQueryBuilder()
      .select(joinSelectFields(USAGER_LIGHT_ATTRIBUTES))
      .where(
        `"structureId" = :structureId and "decision"->>'statut' != :statut`,
        {
          statut: "RADIE",
          structureId: user.structureId,
        }
      )
      .getRawMany();

    const usagersRadiesFirsts = await usagerRepository
      .createQueryBuilder()
      .select(joinSelectFields(USAGER_LIGHT_ATTRIBUTES))
      .where(
        `"structureId" = :structureId and "decision"->>'statut' = :statut`,
        {
          statut: "RADIE",
          structureId: user.structureId,
        }
      )
      .limit(chargerTousRadies ? undefined : 60)
      .orderBy({ "decision->>'dateFin'": "DESC" })
      .getRawMany();

    const usagersRadiesTotalCount = chargerTousRadies
      ? usagersRadiesFirsts.length
      : await usagerRepository
          .createQueryBuilder()
          .where(
            `"structureId" = :structureId and "decision"->>'statut' = :statut`,
            {
              statut: "RADIE",
              structureId: user.structureId,
            }
          )
          .getCount();

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

    const search = dataCompare.cleanString(searchString);

    return usagerRepository
      .createQueryBuilder()
      .select(joinSelectFields(USAGER_LIGHT_ATTRIBUTES))
      .where(
        `"structureId" = :structureId and "decision"->>'statut' = :statut and LOWER(coalesce("nom", '') || ' ' || coalesce("prenom", '')) LIKE :search`,
        {
          statut: "RADIE",
          structureId: user.structureId,
          search: `%${search}%`,
        }
      )
      .limit(10)
      .orderBy({ "decision->>'dateFin'": "DESC" })
      .getRawMany();
  }

  @AllowUserStructureRoles("simple", "responsable", "admin")
  @Post()
  public createUsager(
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
    @CurrentUser() _user: UserStructureAuthenticated,
    @CurrentUsager() currentUsager: Usager
  ) {
    if (!usagerDto.langue || usagerDto.langue === "") {
      usagerDto.langue = null;
    }

    if (
      !currentUsager.customRef &&
      (!usagerDto.customRef || usagerDto.customRef === null)
    ) {
      usagerDto.customRef = currentUsager.ref.toString();
    }

    currentUsager = await usagerRepository.updateOneAndReturn(
      currentUsager.uuid,
      { ...usagerDto }
    );

    await usagerHistoryStateManager.updateHistoryStateWithoutDecision({
      usager: currentUsager,

      createdEvent: "update-usager",
    });

    return currentUsager;
  }

  @UseGuards(UsagerAccessGuard)
  @AllowUserStructureRoles("simple", "responsable", "admin")
  @Post("entretien/:usagerRef")
  public async setEntretien(
    @Body() entretien: EntretienDto,
    @CurrentUser() _user: UserStructureAuthenticated,
    @CurrentUsager() currentUsager: Usager
  ) {
    await usagerEntretienRepository.update(
      { usagerUUID: currentUsager.uuid },
      { ...entretien }
    );

    if (currentUsager.decision.statut === "INSTRUCTION") {
      await usagerRepository.update(
        { uuid: currentUsager.uuid },
        {
          etapeDemande: ETAPE_DOCUMENTS,
        }
      );
    }

    const usager = await usagerRepository.getUsager(currentUsager.uuid);

    await usagerHistoryStateManager.updateHistoryStateWithoutDecision({
      usager,
      createdEvent: "update-entretien",
    });

    return usager;
  }

  @UseGuards(UsagerAccessGuard)
  @AllowUserStructureRoles("simple", "responsable", "admin")
  @Get("next-step/:usagerRef/:etapeDemande")
  public async nextStep(
    @Param("etapeDemande", new ParseIntPipe()) etapeDemande: number,
    @Param("usagerRef", new ParseIntPipe()) _usagerRef: number,
    @CurrentUsager() currentUsager: Usager
  ): Promise<Usager> {
    return usagerRepository.updateOneAndReturn(currentUsager.uuid, {
      etapeDemande,
    });
  }

  @UseGuards(UsagerAccessGuard)
  @AllowUserStructureRoles(...USER_STRUCTURE_ROLE_ALL)
  @Get("stop-courrier/:usagerRef")
  public async stopCourrier(
    @CurrentUsager() currentUsager: Usager,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    @Param("usagerRef", new ParseIntPipe()) _usagerRef: number
  ): Promise<Usager> {
    if (currentUsager.options.npai.actif) {
      currentUsager.options.npai.actif = false;
      currentUsager.options.npai.dateDebut = null;
    } else {
      currentUsager.options.npai.actif = true;
      currentUsager.options.npai.dateDebut = new Date();
    }

    return usagerRepository.updateOneAndReturn(currentUsager.uuid, {
      options: currentUsager.options,
    });
  }

  @AllowUserStructureRoles("simple", "responsable", "admin")
  @Post("check-duplicates-name")
  public async checkDuplicates(
    @Body() duplicateUsagerDto: CheckDuplicateUsagerDto,
    @CurrentUser() user: UserStructureAuthenticated
  ): Promise<Usager[]> {
    let query = `SELECT nom, prenom, ref, "dateNaissance" FROM usager WHERE "structureId" = $1 and LOWER("nom") = $2 and LOWER("prenom") = $3`;

    const params = [
      user.structureId,
      duplicateUsagerDto.nom,
      duplicateUsagerDto.prenom,
    ];

    if (duplicateUsagerDto.usagerRef) {
      query = query + `  and "ref" != $4`;
      params.push(duplicateUsagerDto.usagerRef);
    }
    return usagerRepository.query(query, params);
  }

  @UseGuards(AuthGuard("jwt"), AppUserGuard, UsagerAccessGuard)
  @AllowUserStructureRoles("responsable", "admin")
  @Delete(":usagerRef")
  public async delete(
    @CurrentUser() user: UserStructureAuthenticated,
    @CurrentUsager() usager: Usager,
    @Res() res: ExpressResponse
  ): Promise<ExpressResponse> {
    // Suppression des Documents
    await usagerDocsRepository.delete({
      usagerRef: usager.ref,
      structureId: user.structureId,
    });

    // Suppression des SMS
    await messageSmsRepository.delete({
      usagerRef: usager.ref,
      structureId: user.structureId,
    });

    // Suppression de l'usager
    await usagerRepository.delete({
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

    // Suppression des fichiers de l'usager
    await deleteUsagerFolder(user.structure, usager);

    return res.status(HttpStatus.OK).json({ message: "DELETE_SUCCESS" });
  }

  @UseGuards(UsagerAccessGuard)
  @AllowUserStructureRoles("simple", "responsable", "admin")
  @Post("portail-usager/options/:usagerRef")
  public async editPreupdatePortailUsagerOptionsference(
    @Res() res: Response,
    @Body() dto: UpdatePortailUsagerOptionsDto,
    @CurrentUsager() usager: Usager,
    @CurrentUser() user: UserStructureAuthenticated
  ) {
    try {
      usager.options.portailUsagerEnabled = dto.portailUsagerEnabled;
      const updatedUsager = await usagerRepository.updateOneAndReturn(
        usager.uuid,
        {
          options: usager.options,
        }
      );

      if (usager.options.portailUsagerEnabled) {
        const userUsager = await userUsagerRepository.findOneBy({
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
    } catch (error) {
      appLogger.error("Error updating usager options", {
        error,
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
    @Res() res: Response,
    @Param("typeCerfa") typeCerfa: CerfaDocType,
    @Param("usagerRef", new ParseIntPipe()) _usagerRef: number,
    @CurrentUser() user: UserStructureAuthenticated,
    @CurrentUsager() currentUsager: Usager
  ) {
    const pdfForm =
      typeCerfa === "attestation"
        ? "../../_static/static-docs/attestation.pdf"
        : "../../_static/static-docs/demande.pdf";

    const pdfInfos = generateCerfaData(currentUsager, user, typeCerfa);

    const filePath = await readFile(resolve(__dirname, pdfForm));

    try {
      const buffer = await pdftk.input(filePath).fillForm(pdfInfos).output();
      return res.setHeader("content-type", "application/pdf").send(buffer);
    } catch (err) {
      appLogger.error(
        `CERFA ERROR structure : ${user.structureId} / usager :${currentUsager.ref} `,
        {
          sentry: true,
          error: err,
          context: {
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
  public async findOne(
    @Param("usagerRef", new ParseIntPipe()) _usagerRef: number,
    @CurrentUsager() currentUsager: Usager
  ): Promise<Usager> {
    return currentUsager;
  }
}
