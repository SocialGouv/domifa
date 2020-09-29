import { Controller, Get, Param, Res, UseGuards } from "@nestjs/common";
import { AuthGuard } from "@nestjs/passport";
import * as XLSX from "xlsx";
import { CurrentUser } from "../../auth/current-user.decorator";

import { StructuresService } from "../../structures/structures.service";
import { User } from "../../users/user.interface";
import { UsagersService } from "../services/usagers.service";
import { Usager } from "../interfaces/usagers";
import * as labels from "../../stats/usagers.labels";

import { InteractionsService } from "../../interactions/interactions.service";
import { ResponsableGuard } from "../../auth/guards/responsable.guard";

@Controller("export")
export class ExportController {
  // Données des usagers + ayant-droit
  public dataSheet1: {
    [key: string]: {};
  }[];
  // Données usagers + entretiens
  public dataSheet2: {
    [key: string]: {};
  }[];
  // Données usagers + courriers
  public dataSheet3: {
    [key: string]: {};
  }[];

  constructor(
    private readonly usagersService: UsagersService,
    private readonly structureService: StructuresService,
    private readonly interactionsService: InteractionsService
  ) {
    this.dataSheet1 = [];
    this.dataSheet2 = [];
    this.dataSheet3 = [];
  }

  @UseGuards(AuthGuard("jwt"))
  @UseGuards(ResponsableGuard)
  @Get("")
  public async export(
    @Param("id") id: number,
    @Param("role") role: string,
    @CurrentUser() user: User,
    @Res() res: any
  ) {
    this.dataSheet1 = [
      {
        A: this.dateFr(new Date(), true),
      },
      {
        A: "ID",
        B: "Civilité",
        C: "Nom",
        D: "Prénom",
        E: "Nom d'usage / Surnom",
        F: "Date de naissance",
        G: "Ville de naissance",
        H: "Numéro de téléphone",
        I: "Adresse e-mail",
        J: "Statut de la domiciliation",
        K: "Motif si refusé",
        L: "Motif si radié",
        M: "Date de radiation",
        N: "Type de domiciliation",
        O: "Date début dom actuelle",
        P: "Date fin de dom",
        Q: "Date 1ere dom",
        R: "Date de dernier passage",
        S: "Nombre d'ayants-droits",
        T: "Nom Ayant-Droit",
        U: "Prénom Ayant-Droit",
        V: "Date Naissance Ayant-Droit",
        W: "Lien parenté Ayant-Droit",
      },
    ];

    this.dataSheet2 = [
      {
        A: this.dateFr(new Date(), true),
      },
      {
        A: "ID",
        B: "Civilité",
        C: "Nom",
        D: "Prénom",
        E: "Nom d'usage / Surnom",
        F: "Date de naissance",
        G: "Avez-vous été orienté ?",
        H: "Si OUI, par quelle structure ou personne ?",
        I: "Avez-vous déjà une domiciliation ?",
        J: "Avez-vous des revenus ?",
        K: "Si OUI, de quelle nature ?",
        L: "Quelle est votre lien avec la commune ?",
        M: "Quelle est la composition de votre ménage ?",
        N: "Quelle est votre situation résidentielle ?",
        O: "Si AUTRE LIEU DE VIE, précisions",
        P: "Quelle est la cause de l'instabilité de logement ?",
        Q: "Si AUTRE RAISON, précisions",
        R: "Quel est le motif principal de demande de domiciliation ?",
        S: "Si AUTRE RAISON, précisions",
        T: "Faites-vous l’objet d’un accompagnement social ?",
        U: "Si OUI, par quelle structure ?",
      },
    ];

    this.dataSheet3 = [
      {
        A: this.dateFr(new Date(), true),
      },
      {
        A: "ID",
        B: "Civilité",
        C: "Nom",
        D: "Prénom",
        E: "Nom d'usage / Surnom",
        F: "Date de naissance",
        G: "Courriers enregistrés",
        H: "Courriers distribués",
        I: "Colis enregistrés",
        J: "Colis distribués",
        K: "Avis de passage enregistré",
        L: "Avis de passage distribué",
        M: "Appels",
        N: "Passages",
      },
    ];

    const usagers = await this.usagersService.export(user.structureId);

    for (let i = 0; i <= usagers.length; i++)
      if (i === usagers.length) {
        const sheet1 = XLSX.utils.json_to_sheet(this.dataSheet1, {
          skipHeader: true,
        });

        const sheet2 = XLSX.utils.json_to_sheet(this.dataSheet2, {
          skipHeader: true,
        });

        const sheet3 = XLSX.utils.json_to_sheet(this.dataSheet3, {
          skipHeader: true,
        });

        const wb = XLSX.utils.book_new();

        XLSX.utils.book_append_sheet(wb, sheet1, "Liste des usagers");
        XLSX.utils.book_append_sheet(wb, sheet2, "Entretiens");
        XLSX.utils.book_append_sheet(wb, sheet3, "Courriers");

        const buf = XLSX.write(wb, {
          type: "buffer",
          bookType: "xlsx",
        });
        res.status(200).send(buf);
      } else {
        const usager: Usager = usagers[i];

        if (
          usager.decision.statut === "REFUS" ||
          usager.decision.statut === "RADIE"
        ) {
          if (usager.decision.motif === "AUTRE") {
            usager.decision.motif =
              usager.decision.motifDetails !== ""
                ? "Autre motif" + usager.decision.motifDetails
                : "Autre motif non précisé";
          } else {
            usager.decision.motif =
              usager.decision.statut === "REFUS"
                ? labels.motifsRefus[usager.decision.motif]
                : labels.motifsRadiation[usager.decision.motif];
          }
        } else {
          usager.decision.motif = "";
        }

        const usagerSheet1: {
          [key: string]: {};
        } = {
          A: usager.customId,
          B: usager.sexe,
          C: usager.nom,
          D: usager.prenom,
          E: usager.surnom,
          F: this.dateFr(usager.dateNaissance),
          G: usager.villeNaissance,
          H: usager.phone,
          I: usager.email,
          J: labels.decisionLabels[usager.decision.statut],
          K: usager.decision.statut === "REFUS" ? usager.decision.motif : "",

          L: usager.decision.statut === "RADIE" ? usager.decision.motif : "",
          M:
            usager.decision.statut === "RADIE"
              ? this.dateFr(usager.decision.dateDecision)
              : "",
          N: usager.typeDom,
          O:
            usager.decision.dateDebut && usager.decision.dateDebut !== null
              ? this.dateFr(usager.decision.dateDebut)
              : "",
          P:
            usager.decision.dateFin && usager.decision.dateFin !== null
              ? this.dateFr(usager.decision.dateFin)
              : "",
          Q:
            usager.datePremiereDom && usager.datePremiereDom !== null
              ? this.dateFr(usager.datePremiereDom)
              : "",
          R:
            usager.lastInteraction.dateInteraction &&
            usager.lastInteraction.dateInteraction !== null
              ? this.dateFr(usager.lastInteraction.dateInteraction)
              : "",
          S: usager.ayantsDroits.length,
        };

        const usagerSheet2: {
          [key: string]: any;
        } = {
          A: usager.customId,
          B: usager.sexe,
          C: usager.nom,
          D: usager.prenom,
          E: usager.surnom,
          F: this.dateFr(usager.dateNaissance),
          G: usager.entretien.orientation ? "OUI" : "NON",
          H: usager.entretien.orientation
            ? usager.entretien.orientationDetail
            : "",
          I: usager.entretien.domiciliation ? "OUI" : "NON",
          J: usager.entretien.revenus ? "OUI" : "NON",
          K: usager.entretien.revenus ? usager.entretien.revenusDetail : "",
          L: usager.entretien.liencommune || "",
          M: labels.typeMenage[this.convertNull(usager.entretien.typeMenage)],
          N: labels.residence[this.convertNull(usager.entretien.residence)],
          O:
            usager.entretien.residence === "AUTRE"
              ? usager.entretien.residenceDetail
              : "",
          P: labels.cause[this.convertNull(usager.entretien.cause)],
          Q:
            usager.entretien.cause === "AUTRE"
              ? usager.entretien.causeDetail
              : "",
          R: labels.raison[this.convertNull(usager.entretien.raison)],
          S:
            usager.entretien.raison === "AUTRE"
              ? usager.entretien.raisonDetail
              : "",
          T: usager.entretien.accompagnement ? "OUI" : "NON",
          U: usager.entretien.accompagnement
            ? usager.entretien.accompagnementDetail
            : "",
        };

        const usagerSheet3: {
          [key: string]: {};
        } = {
          A: usager.customId,
          B: usager.sexe,
          C: usager.nom,
          D: usager.prenom,
          E: usager.surnom,
          F: this.dateFr(usager.dateNaissance),
          G: await this.interactionsService.totalInteraction(
            user.structureId,
            usager.id,
            "courrierIn"
          ),
          H: await this.interactionsService.totalInteraction(
            user.structureId,
            usager.id,
            "courrierOut"
          ),
          I: await this.interactionsService.totalInteraction(
            user.structureId,
            usager.id,
            "recommandeIn"
          ),
          J: await this.interactionsService.totalInteraction(
            user.structureId,
            usager.id,
            "recommandeOut"
          ),
          K: await this.interactionsService.totalInteraction(
            user.structureId,
            usager.id,
            "colisIn"
          ),
          L: await this.interactionsService.totalInteraction(
            user.structureId,
            usager.id,
            "colisOut"
          ),
          M: await this.interactionsService.totalInteraction(
            user.structureId,
            usager.id,
            "appel"
          ),
          N: await this.interactionsService.totalInteraction(
            user.structureId,
            usager.id,
            "visite"
          ),
        };

        let indexColumn = 19;
        let indexAd = 1;

        for (const ayantDroit of usager.ayantsDroits) {
          this.dataSheet1[1][this.numToAlpha(indexColumn)] =
            "Nom Ayant-droit " + indexAd;
          this.dataSheet1[1][this.numToAlpha(indexColumn + 1)] =
            "Prénom Ayant-droit " + indexAd;
          this.dataSheet1[1][this.numToAlpha(indexColumn + 2)] =
            "Date Naissance Ayant-Droit " + indexAd;
          this.dataSheet1[1][this.numToAlpha(indexColumn + 3)] =
            "Lien parenté Ayant-droit " + indexAd;

          usagerSheet1[this.numToAlpha(indexColumn)] = ayantDroit.nom;
          usagerSheet1[this.numToAlpha(indexColumn + 1)] = ayantDroit.prenom;
          usagerSheet1[this.numToAlpha(indexColumn + 2)] =
            ayantDroit.dateNaissance;
          usagerSheet1[this.numToAlpha(indexColumn + 3)] = ayantDroit.lien;

          indexAd++;
          indexColumn += 4;
        }

        this.dataSheet1.push(usagerSheet1);
        this.dataSheet2.push(usagerSheet2);
        this.dataSheet3.push(usagerSheet3);
      }
  }

  private convertNull(value: any) {
    return value || "";
  }

  private numToAlpha(num: number) {
    let alpha = "";
    for (; num >= 0; num = num / 26 - 1) {
      alpha = String.fromCharCode((num % 26) + 0x41) + alpha;
    }
    return alpha;
  }

  private padNumber(value: number) {
    return `0${value}`.slice(-2);
  }

  private dateFr(date: Date, complete?: boolean): string {
    const dateString =
      this.padNumber(date.getDate()) +
      "/" +
      this.padNumber(date.getMonth() + 1) +
      "/" +
      date.getFullYear();

    return complete
      ? dateString +
          " à " +
          this.padNumber(date.getHours()) +
          ":" +
          this.padNumber(date.getMinutes())
      : dateString;
  }
}
