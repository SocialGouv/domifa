import { Controller, Get, Param, Res, UseGuards } from "@nestjs/common";
import { AuthGuard } from "@nestjs/passport";

import { ApiBearerAuth, ApiTags } from "@nestjs/swagger";
import { Response } from "express";

import { CurrentUsager } from "../../auth/current-usager.decorator";
import * as fs from "fs";
import * as path from "path";
import { FacteurGuard } from "../../auth/guards/facteur.guard";
import { UsagerAccessGuard } from "../../auth/guards/usager-access.guard";

import { Usager } from "../interfaces/usagers";

import { UsagersService } from "../services/usagers.service";

import { AppUser } from "../../_common/model";
import { CurrentUser } from "../../auth/current-user.decorator";

import * as PizZip from "pizzip";
import moment = require("moment");

// tslint:disable-next-line: no-var-requires
const Docxtemplater = require("docxtemplater");
// tslint:disable-next-line: no-var-requires
const InspectModule = require("docxtemplater/js/inspect-module");

@UseGuards(AuthGuard("jwt"), FacteurGuard)
@ApiTags("docs-custom")
@ApiBearerAuth()
@Controller("docs-custom")
export class DocsCustomController {
  constructor(private readonly usagersService: UsagersService) {}

  // TODO: Upload des documents

  @Get(":id")
  @UseGuards(AuthGuard("jwt"), UsagerAccessGuard, FacteurGuard)
  public async getDocument(
    @Param("id") usagerId: number,
    @Res() res: Response,
    @CurrentUsager() usager: Usager,
    @CurrentUser() user: AppUser
  ) {
    const content = fs.readFileSync(
      path.resolve(__dirname, "../../ressources/attestation_custom.docx"),
      "binary"
    );

    const iModule = InspectModule();

    const zip = new PizZip(content);
    let doc: any;

    try {
      doc = new Docxtemplater(zip, { modules: [iModule] });
    } catch (error) {
      this.errorHandler(error);
    }

    // TODO: vérifier l'intégrité des tags d'un doc
    // const tags = iModule.getAllTags();
    // console.log(tags);

    doc.setData({
      // GENERAL
      DATE_JOUR: moment(new Date()).locale("fr").format("LL"),

      // Responsable
      NOM_RESPONSABLE: this.convertString(user.structure.responsable.nom),
      PRENOM_RESPONSABLE: this.convertString(user.structure.responsable.prenom),
      FONCTION_RESPONSABLE: this.convertString(
        user.structure.responsable.fonction
      ),

      // Structure
      NOM_STRUCTURE: this.convertString(user.structure.nom),
      TYPE_STRUCTURE: user.structure.structureType,
      ADRESSE_STRUCTURE: this.convertString(user.structure.adresse),
      COMPLEMENT_ADRESSE_STRUCTURE: this.convertString(
        user.structure.complementAdresse
      ),
      VILLE_STRUCTURE: this.convertString(user.structure.ville),
      CODE_POSTAL_STRUCTURE: this.convertString(user.structure.codePostal),

      // USAGER
      CIVILITE: usager.sexe === "femme" ? "madame" : "monsieur",
      NOM_USAGER: this.convertString(usager.prenom),
      PRENOM_USAGER: this.convertString(usager.nom),
    });

    try {
      doc.render();
    } catch (error) {
      this.errorHandler(error);
    }

    res.end(doc.getZip().generate({ type: "nodebuffer" }));
  }

  private convertString(value: any) {
    return value === undefined || value === null
      ? ""
      : value.toString().toUpperCase();
  }

  private replaceErrors(key: string, value: any) {
    if (value instanceof Error) {
      return Object.getOwnPropertyNames(value).reduce((error, errorKey) => {
        error[errorKey] = value[errorKey];
        return error;
      }, {});
    }
    return value;
  }

  private errorHandler(error: any) {
    // console.log(JSON.stringify({ error }, this.replaceErrors));

    if (error.properties && error.properties.errors instanceof Array) {
      const errorMessages = error.properties.errors
        .map((propError: any) => {
          return propError.properties.explanation;
        })
        .join("\n");

      // console.log("errorMessages", errorMessages);
      // errorMessages is a humanly readable message looking like this :
      // 'The tag beginning with "foobar" is unopened'
    }
    throw error;
  }
}
