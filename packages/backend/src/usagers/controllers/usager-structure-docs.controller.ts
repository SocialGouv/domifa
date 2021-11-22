import { StructureDocService } from "./../../structures/services/structure-doc.service";
import {
  Controller,
  Get,
  HttpStatus,
  Param,
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
import path = require("path");
import { structureDocRepository } from "../../database";

@UseGuards(AuthGuard("jwt"), AppUserGuard)
@ApiTags("usagers-structure-docs")
@ApiBearerAuth()
@Controller("usagers-structure-docs")
export class UsagerStructureDocsController {
  constructor(private structureDocService: StructureDocService) {}

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

    const content = customDocTemplateLoader.loadCustomDocTemplate({
      docPath: doc.path,
      structureId: user.structureId,
    });

    if (!content) {
      return res
        .status(HttpStatus.BAD_REQUEST)
        .json({ message: "DOC_NOT_FOUND" });
    }

    const docValues = buildCustomDoc(usager, user.structure);

    res.end(generateCustomDoc(content, docValues));
  }

  @Get("domifa/:usagerRef/:docType")
  @UseGuards(AuthGuard("jwt"), AppUserGuard, UsagerAccessGuard)
  @AllowUserStructureRoles("simple", "responsable", "admin")
  public async getDomifaCustomDoc(
    @Param("docType") docType: StructureDocTypesAvailable,
    @CurrentUsager() usager: UsagerLight,
    @CurrentUser() user: UserStructure,
    @Res() res: Response
  ) {
    if (docType !== "attestation_postale" && docType !== "courrier_radiation") {
      return res
        .status(HttpStatus.BAD_REQUEST)
        .json({ message: "INVALID_PARAM_DOCS" });
    }

    // La structure a-t-elle uploadé son propre modèle ?
    const doc: StructureDoc = await structureDocRepository.findOne({
      structureId: user.structureId,
      customDocType: docType,
    });

    if (!doc) {
      return res
        .status(HttpStatus.BAD_REQUEST)
        .json({ message: "DOC_DOMIFA_NOT_FOUND" });
    }

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
    const docValues = buildCustomDoc(usager, user.structure);

    res.end(generateCustomDoc(content, docValues));
  }
}
