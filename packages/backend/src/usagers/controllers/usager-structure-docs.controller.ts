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
import * as PizZip from "pizzip";
import moment = require("moment");

import { CurrentUsager } from "../../auth/current-usager.decorator";

import { FacteurGuard } from "../../auth/guards/facteur.guard";
import { UsagerAccessGuard } from "../../auth/guards/usager-access.guard";

import { UsagersService } from "../services/usagers.service";

import { AppUser, StructureCommon } from "../../_common/model";
import { CurrentUser } from "../../auth/current-user.decorator";

import { domifaConfig } from "../../config";
import { UsagerLight } from "../../database";
import { appLogger } from "../../util";
import { buildCustomDoc } from "../../custom-docs";

// tslint:disable-next-line: no-var-requires
const Docxtemplater = require("docxtemplater");
// tslint:disable-next-line: no-var-requires
const InspectModule = require("docxtemplater/js/inspect-module");

@UseGuards(AuthGuard("jwt"), FacteurGuard)
@ApiTags("usagers-structure-docs")
@ApiBearerAuth()
@Controller("usagers-structure-docs")
export class UsagerStructureDocsController {
  motifsRefus: any;
  constructor(private readonly usagersService: UsagersService) {}

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

    const iModule = InspectModule();

    const zip = new PizZip(content);
    let doc: any;

    try {
      doc = new Docxtemplater(zip, { modules: [iModule], linebreaks: true });
    } catch (error) {
      appLogger.error(`DocTemplater - Opening Doc impossible`, {
        sentry: true,
        extra: {
          error,
        },
      });
    }

    const docValues = buildCustomDoc(usager, user.structure);

    doc.setData(docValues);

    try {
      doc.render();
    } catch (error) {
      appLogger.error(`DocTemplater - Rendering documentimpossible`, {
        sentry: true,
        extra: {
          error,
          usager,
        },
      });
    }

    res.end(doc.getZip().generate({ type: "nodebuffer" }));
  }
}
