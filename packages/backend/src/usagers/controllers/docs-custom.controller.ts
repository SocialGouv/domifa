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

import { Usager } from "../interfaces/usagers";
import { UsagersService } from "../services/usagers.service";

import { AppUser, StructureCommon } from "../../_common/model";
import { CurrentUser } from "../../auth/current-user.decorator";
import { StructureDocKeys } from "../../_common/model/structure-doc/StructureDocKeys.type";

import { residence, typeMenage } from "../../stats/usagers.labels";

// tslint:disable-next-line: no-var-requires
const Docxtemplater = require("docxtemplater");
// tslint:disable-next-line: no-var-requires
const InspectModule = require("docxtemplater/js/inspect-module");

@UseGuards(AuthGuard("jwt"), FacteurGuard)
@ApiTags("structure-doc")
@ApiBearerAuth()
@Controller("docs-custom")
export class DocsCustomController {
  constructor(private readonly usagersService: UsagersService) {}

  @Get(":id")
  @UseGuards(AuthGuard("jwt"), UsagerAccessGuard, FacteurGuard)
  public async getDocument(
    @Param("id") usagerId: number,
    @Param("docType") docType: string,
    @CurrentUsager() usager: Usager,
    @CurrentUser() user: AppUser,
    @Res() res: Response
  ) {
    // TODO: Vérifier qu'il n'existe pas une version custom de ce document

    if (docType !== "attestation_postale" && docType !== "courrier_radiation") {
      return res
        .status(HttpStatus.BAD_REQUEST)
        .json({ message: "INVALID_PARAM_DOCS" });
    }

    const docsName = {
      attestation_postale: "attestation_postale.docx",
      courrier_radiation: "courrier_radiation.docx",
    };

    const content = fs.readFileSync(
      path.resolve(__dirname, "../../ressources/attestation_postale.docx"),
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

    doc.setData(this.buildDoc(usager, user.structure));

    try {
      doc.render();
    } catch (error) {
      this.errorHandler(error);
    }

    res.end(doc.getZip().generate({ type: "nodebuffer" }));
  }

  private buildDoc(
    usager: Usager,
    structure: StructureCommon
  ): {
    [key in StructureDocKeys]: string;
  } {
    return {
      // DATES UTILES
      DATE_JOUR: moment().locale("fr").format("L"),
      DATE_JOUR_HEURE:
        moment().locale("fr").format("L") + " à " + moment().format("LT"),
      DATE_JOUR_LONG: moment().format("LL"),

      // Responsable
      RESPONSABLE_NOM: this.ucFirst(structure.responsable.nom),
      RESPONSABLE_PRENOM: this.ucFirst(structure.responsable.prenom),
      RESPONSABLE_FONCTION: this.ucFirst(structure.responsable.fonction),

      // Structure
      STRUCTURE_NOM: this.ucFirst(structure.nom),
      STRUCTURE_TYPE: "Type de structure",
      STRUCTURE_ADRESSE: this.ucFirst(structure.adresse),
      STRUCTURE_COMPLEMENT_ADRESSE: this.ucFirst(structure.complementAdresse),
      STRUCTURE_VILLE: this.ucFirst(structure.ville),
      STRUCTURE_CODE_POSTAL: structure.codePostal,

      // Si courrier différent
      COURRIER_ADRESSE_STRUCTURE: "Adresse de réception du courrier",
      COURRIER_COMPLEMENT_ADRESSE_STRUCTURE: "Complément d'adresse courrier",
      COURRIER_VILLE_STRUCTURE: "Ville de réception courrier",
      COURRIER_CODE_POSTAL_STRUCTURE: "Code-postal de réception courrier",

      // USAGER INFOS
      USAGER_REF: "Référence dossier",
      USAGER_CUSTOM_REF: "Identifiant personnalisé",
      USAGER_CIVILITE: usager.sexe === "femme" ? "madame" : "monsieur",
      USAGER_NOM: this.ucFirst(usager.nom),
      USAGER_PRENOM: this.ucFirst(usager.prenom),
      USAGER_SURNOM: this.ucFirst(usager.surnom),
      USAGER_DATE_NAISSANCE: moment(usager.dateNaissance)
        .locale("fr")
        .format("L"),

      USAGER_LIEU_NAISSANCE: this.ucFirst(usager.villeNaissance),

      // CONTACT USAGER
      USAGER_PHONE: usager.phone || "",
      USAGER_EMAIL: usager.email || "",

      // STATUT ET TYPE DE DOM
      STATUT_DOM:
        "Statut de la domiciliation: actif, radié, refusé, en attente",
      TYPE_DOM:
        "Type de domiciliation : première domiciliation ou renouvellement",

      // REFUS / RADIATION
      MOTIF_REFUS: "Motif du refus",
      MOTIF_RADIATION: "Motif de la radiation",
      ORIENTATION_REFUS: "Orientation choisir suite au refus",

      DATE_REFUS: "Date du refus",
      DATE_RADIATION: "Date de la radiation",
      // DATES DOMICILIATION
      DATE_DEBUT_DOM: "Date de Début de la domiciliation (ex: 12/10/2020)",
      DATE_FIN_DOM: "Date de fin de la domiciliation (ex: 12/10/2020)",
      DATE_PREMIERE_DOM: "Date de la 1ere domiciliation (ex: 12/10/2020)",
      DATE_DERNIER_PASSAGE: "Date de dernier passage (ex: 01/09/2020 à 10h45)",

      // ENTRETIEN

      ENTRETIEN_CAUSE_INSTABILITE: "Cause instabilité logement",
      ENTRETIEN_RAISON_DEMANDE: "Motif principal de la demande",
      ENTRETIEN_ACCOMPAGNEMENT: "Accompagnement social",

      ENTRETIEN_ORIENTE_PAR: usager.entretien.orientation
        ? "Oui: " + usager.entretien.orientationDetail
        : "Non",

      ENTRETIEN_DOMICILIATION_EXISTANTE: usager.entretien.domiciliation
        ? "OUI"
        : "NON",

      ENTRETIEN_REVENUS: usager.entretien.revenus
        ? "OUI" + usager.entretien.revenusDetail
        : "NON",

      ENTRETIEN_LIEN_COMMUNE: usager.entretien.liencommune || "",

      ENTRETIEN_COMPOSITION_MENAGE: typeMenage[usager.entretien.typeMenage],

      ENTRETIEN_SITUATION_RESIDENTIELLE:
        usager.entretien.residence === "AUTRE"
          ? " Autre : " + usager.entretien.residenceDetail
          : residence[usager.entretien.residence],
    };
  }

  private ucFirst(value: string) {
    return value === undefined || value === null
      ? ""
      : value.charAt(0).toUpperCase() + value.slice(1);
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
