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

import * as fs from "fs";
import * as path from "path";

import { CurrentUsager } from "../../auth/current-usager.decorator";

import { FacteurGuard } from "../../auth/guards/facteur.guard";
import { UsagerAccessGuard } from "../../auth/guards/usager-access.guard";

import { AppUser } from "../../_common/model";
import { CurrentUser } from "../../auth/current-user.decorator";

import { domifaConfig } from "../../config";
import { UsagerLight } from "../../database";

import { buildCustomDoc, generateCustomDoc } from "../custom-docs";

@UseGuards(AuthGuard("jwt"), FacteurGuard)
@ApiTags("usagers-structure-docs")
@ApiBearerAuth()
@Controller("usagers-structure-docs")
export class UsagerStructureDocsController {
  constructor() {}

  @Get(":usagerRef/:docType")
  @UseGuards(AuthGuard("jwt"), UsagerAccessGuard, FacteurGuard)
  public async getDocument(
    @Param("docType") docType: string,
    @CurrentUsager() usager: UsagerLight,
    @CurrentUser() user: AppUser,
    @Res() res: Response
  ) {
    if (docType !== "attestation_postale" && docType !== "courrier_radiation") {
      return res
        .status(HttpStatus.BAD_REQUEST)
        .json({ message: "INVALID_PARAM_DOCS" });
    }

    const docsName = {
      attestation_postale: "attestation_postale.docx",
      courrier_radiation: "courrier_radiation.docx",
    };

    let content = fs.readFileSync(
      path.resolve(__dirname, "../../ressources/" + docsName[docType]),
      "binary"
    );

    // Une version customisée par la structure existe-t-elle ?
    const customDocPath =
      domifaConfig().upload.basePath +
      user.structureId +
      "/docs/" +
      docsName[docType];

    if (fs.existsSync(path.resolve(__dirname, customDocPath))) {
      // file exists
      content = fs.readFileSync(
        path.resolve(__dirname, customDocPath),
        "binary"
      );
    }

    const docValues = buildCustomDoc(usager, user.structure);

    res.end(generateCustomDoc(content, docValues));
  }
}
