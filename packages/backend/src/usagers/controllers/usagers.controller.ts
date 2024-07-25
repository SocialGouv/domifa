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
  joinSelectFields,
} from "../../database";

import { appLogger, cleanPath } from "../../util";
import { dataCompare } from "../../util/dataCompare.service";
import {
  UserStructureAuthenticated,
  USER_STRUCTURE_ROLE_ALL,
} from "../../_common/model";
import {
  CheckDuplicateUsagerDto,
  CreateUsagerDto,
  EntretienDto,
  ContactDetailsDto,
} from "../dto";
import { SearchUsagerDto } from "../dto/search-usager.dto";
import { UsagersService } from "../services";
import { AppLogsService } from "../../modules/app-logs/app-logs.service";
import { generateCerfaData } from "../services/cerfa";

import pdftk = require("node-pdftk");

import { join, resolve } from "path";
import { readFile } from "fs-extra";
import { ExpressResponse } from "../../util/express";
import {
  Usager,
  ETAPE_DOCUMENTS,
  CerfaDocType,
  UsagerDecision,
} from "@domifa/common";
import { UsagerHistoryStateService } from "../services/usagerHistoryState.service";
import { domifaConfig } from "../../config";
import { FileManagerService } from "../../util/file-manager/file-manager.service";
import { Not } from "typeorm";

@Controller("usagers")
@ApiTags("usagers")
@UseGuards(AuthGuard("jwt"), AppUserGuard)
@ApiBearerAuth()
export class UsagersController {
  constructor(
    private readonly usagersService: UsagersService,
    private readonly appLogsService: AppLogsService,
    private readonly usagerHistoryStateService: UsagerHistoryStateService,
    private readonly fileManagerService: FileManagerService
  ) {}

  @Get()
  @AllowUserStructureRoles(...USER_STRUCTURE_ROLE_ALL)
  public async findAllByStructure(
    @Query("chargerTousRadies", new ParseBoolPipe())
    chargerTousRadies: boolean,
    @CurrentUser() user: UserStructureAuthenticated
  ) {
    const usagersNonRadies = await usagerRepository.find({
      where: {
        statut: Not("RADIE"),
        structureId: user.structureId,
      },
      select: USAGER_LIGHT_ATTRIBUTES,
    });

    const usagersRadiesFirsts = await usagerRepository.find({
      where: {
        statut: "RADIE",
        structureId: user.structureId,
      },
      select: USAGER_LIGHT_ATTRIBUTES,
      take: chargerTousRadies ? undefined : 60,
    });

    const usagersRadiesTotalCount = chargerTousRadies
      ? usagersRadiesFirsts.length
      : await usagerRepository.count({
          where: {
            statut: "RADIE",
            structureId: user.structureId,
          },
        });

    const filterHistorique = (usager: Usager) => {
      if (usager.historique && Array.isArray(usager.historique)) {
        usager.historique = usager.historique.map((item: UsagerDecision) => ({
          statut: item.statut,
          dateDecision: item.dateDecision,
          dateDebut: item.dateDebut,
          dateFin: item.dateFin,
        })) as UsagerDecision[];
      }
      return usager;
    };

    // Appliquer le filtre sur les deux ensembles d'usagers
    const filteredUsagersNonRadies = usagersNonRadies.map(filterHistorique);
    const filteredUsagersRadiesFirsts =
      usagersRadiesFirsts.map(filterHistorique);

    return {
      usagersNonRadies: filteredUsagersNonRadies,
      usagersRadiesFirsts: filteredUsagersRadiesFirsts,
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
        `"structureId" = :structureId and  statut  = :statut and LOWER("nom"|| ' ' || "prenom") LIKE :search`,
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

    await usagerRepository.update(
      { uuid: currentUsager.uuid },
      { ...usagerDto }
    );

    const createdAt = new Date();
    const historyBeginDate = createdAt;

    await this.usagerHistoryStateService.buildState({
      usager: currentUsager,
      createdAt,
      createdEvent: "update-usager",
      historyBeginDate,
    });

    return currentUsager;
  }

  @UseGuards(UsagerAccessGuard)
  @AllowUserStructureRoles("simple", "responsable", "admin", "facteur")
  @Patch("contact-details/:usagerRef")
  public async patchMailAndPhone(
    @Body() contactDetails: ContactDetailsDto,
    @CurrentUser() _user: UserStructureAuthenticated,
    @CurrentUsager() currentUsager: Usager
  ) {
    const elementsToUpdate = {
      telephone: contactDetails.telephone,
      contactByPhone: contactDetails.contactByPhone,
      email: contactDetails.email,
    };
    await usagerRepository.update(
      { uuid: currentUsager.uuid },
      {
        ...elementsToUpdate,
      }
    );

    return {
      ...currentUsager,
      ...elementsToUpdate,
    };
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

    // TODO: optimize
    const usager = await usagerRepository.getUsager(currentUsager.uuid);
    const createdAt = new Date();
    const historyBeginDate = createdAt;

    await this.usagerHistoryStateService.buildState({
      usager,
      createdAt,
      createdEvent: "update-entretien",
      historyBeginDate,
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
    await usagerRepository.update(
      { uuid: currentUsager.uuid },
      {
        etapeDemande,
      }
    );
    return { ...currentUsager, etapeDemande };
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

    await usagerRepository.update(
      { uuid: currentUsager.uuid },
      {
        options: currentUsager.options,
      }
    );
    return currentUsager;
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

    console.log(query);
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

    // Suppression du domicilié
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

    const key =
      join(
        domifaConfig().upload.bucketRootDir,
        "usager-documents",
        cleanPath(user.structure.uuid),
        cleanPath(usager.uuid)
      ) + "/";

    try {
      await this.fileManagerService.deleteAllUnderStructure(key);
    } catch (e) {
      console.warn(e);
    }
    return res.status(HttpStatus.OK).json({ message: "DELETE_SUCCESS" });
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
