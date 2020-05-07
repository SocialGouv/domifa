import { Controller, Get, Param, Res, UseGuards } from "@nestjs/common";
import { AuthGuard } from "@nestjs/passport";
import * as XLSX from "xlsx";
import { CurrentUser } from "../../auth/current-user.decorator";
import { RolesGuard } from "../../auth/roles.guard";
import { StructuresService } from "../../structures/structures.service";
import { User } from "../../users/user.interface";
import { UsagersService } from "../services/usagers.service";
import { Usager } from "../interfaces/usagers";

/* DÉCISIONS */
export const decisionLabels: { [key: string]: any } = {
  ATTENTE_DECISION: "attente de décision",
  INSTRUCTION: "À compléter",
  RADIE: "Radié",
  REFUS: "Refusé",
  VALIDE: "Actif",
};

/* MOTIFS DE RADIATION ET REFUS */
export const motifsRadiation: { [key: string]: any } = {
  A_SA_DEMANDE: "À la demande de la personne",
  ENTREE_LOGEMENT: "Plus de lien avec la commune",
  FIN_DE_DOMICILIATION:
    "La domiciliation est arrivée à échéance (1 an) et son renouvellement n'a pas été sollicité",
  NON_MANIFESTATION_3_MOIS:
    "Non-manifestation de la personne pendant plus de 3 mois consécutifs",
  NON_RESPECT_REGLEMENT: "Non-respect du règlement",
  PLUS_DE_LIEN_COMMUNE: "Entrée dans un logement/hébergement stable",
};

export const motifsRefus: { [key: string]: any } = {
  HORS_AGREMENT: "En dehors des critères du public domicilié",
  LIEN_COMMUNE: "Absence de lien avec la commune",
  SATURATION: "Nombre maximal de domiciliations atteint",
};

@Controller("export")
export class ExportController {
  public datas: {
    [key: string]: {};
  }[];

  constructor(
    private readonly usagersService: UsagersService,
    private readonly structureService: StructuresService
  ) {
    this.datas = [];
  }

  @UseGuards(AuthGuard("jwt"))
  @UseGuards(RolesGuard)
  @Get("")
  public async export(
    @Param("id") id: number,
    @Param("role") role: string,
    @CurrentUser() user: User,
    @Res() res: any
  ) {
    this.datas = [
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
        M: "Type de domiciliation",
        N: "Date début dom actuelle",
        O: "Date fin de dom",
        P: "Date 1ere dom",
      },
    ];

    const usagers = await this.usagersService.export(user.structureId);

    for (let i = 0; i <= usagers.length; i++)
      if (i === usagers.length) {
        const ws = XLSX.utils.json_to_sheet(this.datas, {
          skipHeader: true,
        });
        const wb = XLSX.utils.book_new();

        XLSX.utils.book_append_sheet(wb, ws, "Liste des usagers");
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
                ? motifsRefus[usager.decision.motif]
                : motifsRadiation[usager.decision.motif];
          }
        } else {
          usager.decision.motif = "";
        }

        const formattedUsager = {
          A: usager.customId,
          B: usager.sexe,
          C: usager.nom,
          D: usager.prenom,
          E: usager.surnom,
          F: this.dateFr(usager.dateNaissance),
          G: usager.villeNaissance,
          H: usager.phone,
          I: usager.email,
          J: decisionLabels[usager.decision.statut],
          K: usager.decision.statut === "REFUS" ? usager.decision.motif : "",
          L: usager.decision.statut === "RADIE" ? usager.decision.motif : "",
          M: usager.typeDom,
          N:
            usager.decision.dateDebut && usager.decision.dateDebut !== null
              ? this.dateFr(usager.decision.dateDebut)
              : "",
          O:
            usager.decision.dateFin && usager.decision.dateFin !== null
              ? this.dateFr(usager.decision.dateFin)
              : "",
          P:
            usager.datePremiereDom && usager.datePremiereDom !== null
              ? this.dateFr(usager.datePremiereDom)
              : "",
        };
        this.datas.push(formattedUsager);
      }
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
