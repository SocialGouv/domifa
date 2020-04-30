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
    this.datas = [
      {
        A: new Date().toLocaleDateString("fr-FR", {
          year: "numeric",
          month: "numeric",
          day: "numeric",
          hour: "numeric",
          minute: "numeric",
        }),
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
    const usagers = await this.usagersService.export(user.structureId);

    for (let i = 0; i <= usagers.length; i++)
      if (i === usagers.length) {
        const ws = XLSX.utils.json_to_sheet(this.datas, {
          skipHeader: true,
        });
        const wb = XLSX.utils.book_new();

        XLSX.utils.book_append_sheet(wb, ws, "SheetJS");
        const buf = XLSX.write(wb, {
          type: "buffer",
          bookType: "xlsx",
        });

        /* send to client */
        res.status(200).send(buf);
      } else {
        const usager: Usager = usagers[i];
        const options = { year: "numeric", month: "numeric", day: "numeric" };

        if (
          usager.decision.statut === "REFUS" ||
          usager.decision.statut === "RADIE"
        ) {
          if (usager.decision.motif === "AUTRE") {
            usager.decision.motif =
              usager.decision.motifDetails !== ""
                ? usager.decision.motifDetails
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
          A: usager.id,
          B: usager.nom,
          C: usager.prenom,
          D: usager.surnom,
          E: usager.sexe,
          F: usager.dateNaissance.toLocaleDateString("fr-FR", options),
          G: usager.villeNaissance,
          H: usager.phone,
          I: usager.email,
          J: decisionLabels[usager.decision.statut],
          K: usager.decision.motif,
          L: usager.decision.motif,
          M: usager.decision.typeDom,
          N:
            usager.decision.dateDebut && usager.decision.dateDebut !== null
              ? usager.decision.dateDebut.toLocaleDateString("fr-FR", options)
              : "",
          O:
            usager.decision.dateFin && usager.decision.dateFin !== null
              ? usager.decision.dateFin.toLocaleDateString("fr-FR", options)
              : "",
          P:
            usager.datePremiereDom && usager.datePremiereDom !== null
              ? usager.datePremiereDom.toLocaleDateString("fr-FR", options)
              : "",
        };
        this.datas.push(formattedUsager);
      }
  }
}
