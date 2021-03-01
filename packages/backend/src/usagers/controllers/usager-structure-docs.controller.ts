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
import { StructureDocKeys } from "../../_common/model/structure-doc/StructureDocKeys.type";

import {
  decisionLabels,
  motifsRadiation,
  motifsRefus,
  residence,
  typeMenage,
} from "../../stats/usagers.labels";
import { domifaConfig } from "../../config";
import { UsagerLight } from "../../database";
import { appLogger } from "../../util";

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

    const docValues = this.buildDoc(usager, user.structure);
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

  private buildDoc(
    usager: UsagerLight,
    structure: StructureCommon
  ): {
    [key in StructureDocKeys]: string;
  } {
    // Adresse
    let adresseStructure = this.ucFirst(structure.adresse);

    if (this.notEmpty(structure.complementAdresse)) {
      adresseStructure =
        adresseStructure + ", " + this.ucFirst(structure.complementAdresse);
    }

    // Motif de refus

    if (
      usager.decision.statut === "REFUS" ||
      usager.decision.statut === "RADIE"
    ) {
      if (usager.decision.motif === "AUTRE") {
        usager.decision.motif =
          usager.decision.motifDetails !== ""
            ? "Autre motif" + usager.decision.motifDetails
            : ("Autre motif non précisé" as any);
      } else {
        usager.decision.motif =
          usager.decision.statut === "REFUS"
            ? motifsRefus[usager.decision.motif]
            : (motifsRadiation[usager.decision.motif] as any);
      }
    } else {
      usager.decision.motif = "" as any;
    }

    return {
      // DATES UTILES
      DATE_JOUR: moment().locale("fr").format("L"),
      DATE_JOUR_HEURE:
        moment().locale("fr").format("L") + " à " + moment().format("LT"),
      DATE_JOUR_LONG: moment().locale("fr").format("LL"),

      // INFOS RESPONSABLE
      RESPONSABLE_NOM: this.ucFirst(structure.responsable.nom),
      RESPONSABLE_PRENOM: this.ucFirst(structure.responsable.prenom),
      RESPONSABLE_FONCTION: structure.responsable.fonction,

      // INFOS STRUCTURE
      STRUCTURE_NOM: this.ucFirst(structure.nom),
      STRUCTURE_TYPE: "Type de structure",
      STRUCTURE_ADRESSE: adresseStructure,

      STRUCTURE_COMPLEMENT_ADRESSE: "",
      STRUCTURE_VILLE: this.ucFirst(structure.ville),
      STRUCTURE_CODE_POSTAL: structure.codePostal,

      // ADRESSE COURRIER
      STRUCTURE_COURRIER_ADRESSE: "",
      STRUCTURE_COURRIER_COMPLEMENT_ADRESSE: "",
      STRUCTURE_COURRIER_VILLE: "",
      STRUCTURE_COURRIER_CODE_POSTAL: "",

      // INFOS USAGER
      USAGER_REF: usager.ref.toString(),
      USAGER_CUSTOM_REF: usager.customRef,
      USAGER_CIVILITE: usager.sexe === "femme" ? "Madame" : "Monsieur",
      USAGER_NOM: this.ucFirst(usager.nom),
      USAGER_PRENOM: this.ucFirst(usager.prenom),
      USAGER_SURNOM: this.ucFirst(usager.surnom) || "",
      USAGER_DATE_NAISSANCE: moment(usager.dateNaissance)
        .locale("fr")
        .format("L"),

      USAGER_LIEU_NAISSANCE: this.ucFirst(usager.villeNaissance),

      // CONTACT USAGER
      USAGER_PHONE: usager.phone || "",
      USAGER_EMAIL: usager.email || "",

      // STATUT ET TYPE DE DOM
      STATUT_DOM: decisionLabels[usager.decision.statut],
      TYPE_DOM:
        "Type de domiciliation : première domiciliation ou renouvellement",

      // REFUS / RADIATION
      MOTIF_RADIATION: usager.decision.motif,
      DATE_RADIATION: moment(usager.decision.dateDecision)
        .locale("fr")
        .format("LL"),

      // DATES DOMICILIATION
      DATE_DEBUT_DOM: moment(usager.decision.dateDebut)
        .locale("fr")
        .format("LL"),
      DATE_FIN_DOM: moment(usager.decision.dateFin).locale("fr").format("LL"),

      DATE_PREMIERE_DOM: moment(usager.datePremiereDom)
        .locale("fr")
        .format("LL"),

      DATE_DERNIER_PASSAGE: moment(usager.lastInteraction.dateInteraction)
        .locale("fr")
        .format("LL"),

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

  private notEmpty(value: string): boolean {
    return (
      typeof value !== "undefined" && value !== null && value.trim() !== ""
    );
  }
}
