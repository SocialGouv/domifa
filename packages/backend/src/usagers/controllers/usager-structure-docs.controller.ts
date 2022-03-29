import {
  Body,
  Controller,
  Get,
  HttpStatus,
  Param,
  Post,
  Res,
  UseGuards,
} from "@nestjs/common";
import { AuthGuard } from "@nestjs/passport";
import { ApiBearerAuth, ApiOperation, ApiTags } from "@nestjs/swagger";
import { Response } from "express";

import { AllowUserStructureRoles } from "../../auth/decorators";
import { CurrentUsager } from "../../auth/decorators/current-usager.decorator";
import { CurrentUser } from "../../auth/decorators/current-user.decorator";
import { AppUserGuard } from "../../auth/guards";
import { UsagerAccessGuard } from "../../auth/guards/usager-access.guard";
import { domifaConfig } from "../../config";
import { structureDocRepository } from "../../database";
import {
  StructureDoc,
  StructureDocTypesAvailable,
  UsagerLight,
  UserStructure,
} from "../../_common/model";
import {
  buildCustomDoc,
  customDocTemplateLoader,
  generateCustomDoc,
} from "../custom-docs";
import { StructureDocService } from "./../../structures/services/structure-doc.service";
import { AppLogsService } from "../../modules/app-logs/app-logs.service";

import * as path from "path";
@UseGuards(AuthGuard("jwt"), AppUserGuard)
@ApiTags("usagers-structure-docs")
@ApiBearerAuth()
@Controller("usagers-structure-docs")
export class UsagerStructureDocsController {
  constructor(
    private structureDocService: StructureDocService,
    private appLogsService: AppLogsService
  ) {}

  @ApiOperation({ summary: "Télécharger un document pré-rempli" })
  @Get("structure/:usagerRef/:structureDocUuid")
  @UseGuards(AuthGuard("jwt"), AppUserGuard, UsagerAccessGuard)
  @AllowUserStructureRoles("simple", "responsable", "admin")
  public async getStructureCustomDoc(
    @CurrentUsager() usager: UsagerLight,
    @CurrentUser() user: UserStructure,
    @Param("structureDocUuid") structureDocUuid: string,
    @Res() res: Response
  ) {
    const doc: StructureDoc = await this.structureDocService.findOne(
      user.structureId,
      structureDocUuid
    );

    if (!doc) {
      return res
        .status(HttpStatus.BAD_REQUEST)
        .json({ message: "DOC_NOT_FOUND" });
    }

    // Document statique
    if (!doc.custom) {
      const output = path.join(
        domifaConfig().upload.basePath,
        `${user.structureId}`,
        "docs",
        doc.path
      );

      return res.status(HttpStatus.OK).sendFile(output as string);
    }

    // Document à compléter
    const content = customDocTemplateLoader.loadCustomDocTemplate({
      docPath: doc.path,
      structureId: user.structureId,
    });

    if (!content) {
      return res
        .status(HttpStatus.BAD_REQUEST)
        .json({ message: "DOC_NOT_FOUND" });
    }

    const docValues = buildCustomDoc({
      usager,
      structure: user.structure,
      date: new Date(),
    });

    try {
      const docGenerated = generateCustomDoc(content, docValues);
      return res.end(docGenerated);
    } catch (e) {
      return res
        .status(HttpStatus.BAD_REQUEST)
        .json({ message: "CANNOT_COMPLETE_DOC" });
    }
  }

  @ApiOperation({
    summary:
      "Télécharger un document pré-rempli fourni par Domifa (courrier radiation, identifiants, attestation postale)",
  })
  @Post("domifa/:usagerRef/:docType")
  @UseGuards(AuthGuard("jwt"), AppUserGuard, UsagerAccessGuard)
  @AllowUserStructureRoles("simple", "responsable", "admin")
  public async getDomifaCustomDoc(
    @Param("docType") docType: StructureDocTypesAvailable,
    @Body() extraUrlParametersFromClient: { [name: string]: string },
    @CurrentUsager() usager: UsagerLight,
    @CurrentUser() user: UserStructure,
    @Res() res: Response
  ) {
    const availableTypes: StructureDocTypesAvailable[] = [
      "attestation_postale",
      "courrier_radiation",
      "acces_espace_domicilie",
    ];
    if (!availableTypes.includes(docType)) {
      return res
        .status(HttpStatus.BAD_REQUEST)
        .json({ message: "INVALID_PARAM_DOCS" });
    }

    // La structure a-t-elle uploadé son propre modèle ?
    const doc: StructureDoc = await structureDocRepository.findOne({
      structureId: user.structureId,
      customDocType: docType,
    });

    const content = doc
      ? customDocTemplateLoader.loadCustomDocTemplate({
          docPath: doc.path,
          structureId: user.structureId,
        })
      : customDocTemplateLoader.loadDefaultDocTemplate({
          docType,
        });

    if (!content) {
      return res
        .status(HttpStatus.BAD_REQUEST)
        .json({ message: "DOC_DOMIFA_NOT_FOUND" });
    }

    const extraParameters =
      docType === "acces_espace_domicilie"
        ? {
            ESPACE_DOM_URL: domifaConfig().apps.portailUsagersUrl,
            ESPACE_DOM_ID: extraUrlParametersFromClient?.ESPACE_DOM_ID,
            ESPACE_DOM_MDP: extraUrlParametersFromClient?.ESPACE_DOM_MDP,
          }
        : {};

    const docValues = buildCustomDoc({
      usager,
      structure: user.structure,
      extraParameters,
      date: new Date(),
    });

    if (docType === "acces_espace_domicilie") {
      await this.appLogsService.create({
        userId: user.id,
        usagerRef: usager.ref,
        structureId: user.structureId,
        action: "DOWNLOAD_PASSWORD_PORTAIL",
      });
    }

    try {
      const docGenerated = generateCustomDoc(content, docValues);
      return res.end(docGenerated);
    } catch (e) {
      console.log(e);
      return res
        .status(HttpStatus.BAD_REQUEST)
        .json({ message: "CANNOT_COMPLETE_DOMIFA_DOCS" });
    }
  }
}
