import {
  Body,
  Controller,
  Get,
  HttpStatus,
  Param,
  ParseUUIDPipe,
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
import { UserStructureAuthenticated } from "../../_common/model";
import {
  buildCustomDoc,
  customDocTemplateLoader,
  generateCustomDoc,
} from "../services/custom-docs";

import { AppLogsService } from "../../modules/app-logs/app-logs.service";
import { join } from "path";
import { cleanPath } from "../../util";
import { FileManagerService } from "../../util/file-manager/file-manager.service";
import {
  StructureDoc,
  StructureDocTypesAvailable,
  Usager,
} from "@domifa/common";

@UseGuards(AuthGuard("jwt"), AppUserGuard)
@ApiTags("usagers-structure-docs")
@ApiBearerAuth()
@Controller("usagers-structure-docs")
export class UsagerStructureDocsController {
  constructor(
    private readonly appLogsService: AppLogsService,
    private readonly fileManagerService: FileManagerService
  ) {}

  @ApiOperation({ summary: "Télécharger un document pré-rempli" })
  @Get("structure/:usagerRef/:structureDocUuid")
  @UseGuards(AuthGuard("jwt"), AppUserGuard, UsagerAccessGuard)
  @AllowUserStructureRoles("simple", "responsable", "admin")
  public async getStructureCustomDoc(
    @CurrentUsager() usager: Usager,
    @CurrentUser() user: UserStructureAuthenticated,
    @Param("structureDocUuid", new ParseUUIDPipe()) structureDocUuid: string,
    @Res() res: Response
  ) {
    const doc: StructureDoc = await structureDocRepository.findOneBy({
      structureId: user.structureId,
      uuid: structureDocUuid,
    });

    if (!doc) {
      return res
        .status(HttpStatus.BAD_REQUEST)
        .json({ message: "DOC_NOT_FOUND" });
    }

    // Document statique
    if (!doc.custom) {
      const filePath = join(
        "structure-documents",
        cleanPath(`${user.structureId}`),
        doc.path
      );
      return await this.fileManagerService.downloadObject(filePath, res);
    }

    // Document à compléter
    const filePath = join(
      "structure-documents",
      cleanPath(`${doc.structureId}`),
      doc.path
    );

    const content = await this.fileManagerService.getObjectAndStream(filePath);

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
      const docGenerated = await generateCustomDoc(
        content.toString(),
        docValues
      );
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
    @CurrentUsager() usager: Usager,
    @CurrentUser() user: UserStructureAuthenticated,
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
    const doc = await structureDocRepository.findOneBy({
      structureId: user.structureId,
      customDocType: docType,
    });

    let content = "";

    if (doc) {
      const filePath = join(
        "structure-documents",
        cleanPath(`${doc.structureId}`),
        doc.path
      );

      content = await this.fileManagerService.getObjectAndStream(filePath);
    } else {
      content = await customDocTemplateLoader.loadDefaultDocTemplate({
        docType,
      });
    }

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
      const docGenerated = await generateCustomDoc(content, docValues);
      return res.end(docGenerated);
    } catch (e) {
      return res
        .status(HttpStatus.BAD_REQUEST)
        .json({ message: "CANNOT_COMPLETE_DOMIFA_DOCS" });
    }
  }
}
