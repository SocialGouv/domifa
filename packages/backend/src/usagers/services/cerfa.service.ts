import { Injectable } from "@nestjs/common";
import * as fs from "fs";
import * as pdftk from "node-pdftk";
import * as path from "path";
import { User } from "../../users/user.interface";
import { Usager } from "../interfaces/usagers";

@Injectable()
export class CerfaService {
  public infosPdf: any;

  public dateNaissance: any;

  public dateDemande: any;
  public dateDebut: any;
  public dateFin: any;
  public datePremiereDom: any;

  public dateRdv: {
    annee: string;
    jour: string;
    mois: string;
    hours: string;
    minutes: string;
  };
  public motif: string;
  public motifsRefus: {
    [key: string]: string;
  };

  constructor() {
    this.dateRdv = { annee: "", jour: "", mois: "", hours: "", minutes: "" };
    this.motif = "";

    this.motifsRefus = {
      AUTRE: "Autres",
      HORS_AGREMENT: "En dehors des critères du public domicilié",
      LIEN_COMMUNE: "Absence de lien avec la commune",
      SATURATION: "Nombre maximal domiciliations atteint"
    };
  }

  public async attestation(usager: Usager, user: User) {
    let ayantsDroitsTexte = "";

    for (const ayantDroit of usager.ayantsDroits) {
      ayantsDroitsTexte =
        ayantsDroitsTexte +
        ayantDroit.nom +
        " " +
        ayantDroit.prenom +
        " né(e) le " +
        ayantDroit.dateNaissance +
        " - ";
    }

    const sexe = usager.sexe === "femme" ? "1" : "2";

    this.dateNaissance = this.convertDate(usager.dateNaissance);
    this.dateRdv = this.convertDate(usager.rdv.dateRdv);
    this.dateDemande = this.convertDate(usager.decision.dateDecision);
    this.datePremiereDom = this.convertDate(usager.datePremiereDom);

    if (usager.decision.statut === "REFUS") {
      this.motif = this.motifsRefus[usager.decision.motif];
      if (usager.decision.motif === "AUTRE") {
        this.motif = this.motif + " : " + usager.decision.motifDetails;
      }
    }

    usager.villeNaissance = usager.villeNaissance.toUpperCase();
    usager.nom = usager.nom.toUpperCase();
    usager.prenom = usager.prenom.toUpperCase();

    const adresseStructure =
      user.structure.nom +
      "\n" +
      user.structure.adresse +
      ", " +
      user.structure.ville +
      ", " +
      user.structure.codePostal;

    let pdfForm = "../../ressources/attestation.pdf";

    this.infosPdf = {
      "topmostSubform[0].Page1[0].AdressePostale[0]": adresseStructure,
      "topmostSubform[0].Page1[0].AyantsDroits[0]": ayantsDroitsTexte,
      "topmostSubform[0].Page1[0].Courriel[0]": user.structure.email,
      "topmostSubform[0].Page1[0].Datenaissance1[0]": this.dateNaissance.jour,
      "topmostSubform[0].Page1[0].Datenaissance2[0]": this.dateNaissance.mois,
      "topmostSubform[0].Page1[0].Datenaissance3[0]": this.dateNaissance.annee,
      "topmostSubform[0].Page1[0].LieuNaissance[0]": usager.villeNaissance,
      "topmostSubform[0].Page1[0].Mme-Monsieur1[0]": sexe,
      "topmostSubform[0].Page1[0].Nomdelorganisme[0]": user.structure.nom,
      "topmostSubform[0].Page1[0].Noms[0]": usager.nom,
      "topmostSubform[0].Page1[0].PréfectureayantDélivré[0]":
        user.structure.departement,
      "topmostSubform[0].Page1[0].Prénoms[0]": usager.prenom,
      "topmostSubform[0].Page1[0].RespOrganisme[0]":
        user.structure.responsable.nom +
        ", " +
        user.structure.responsable.prenom +
        ", " +
        user.structure.responsable.fonction,
      "topmostSubform[0].Page1[0].téléphone[0]": user.structure.phone,
      "topmostSubform[0].Page2[0].NomOrgaDomiciliataire[0]": user.structure.nom,
      "topmostSubform[0].Page2[0].NuméroAgrément[0]": user.structure.agrement,
      "topmostSubform[0].Page2[0].PrefectureDelivrAgrément[0]":
        user.structure.departement
    };

    if (usager.decision.statut === "VALIDE") {
      this.dateDebut = this.convertDate(usager.decision.dateDebut);
      this.dateFin = this.convertDate(usager.decision.dateFin);

      this.infosPdf["topmostSubform[0].Page1[0].NumAgrement[0]"] =
        user.structure.agrement;

      this.infosPdf[
        "topmostSubform[0].Page1[0].AdressePostaleOrganisme[0]"
      ] = adresseStructure;

      this.infosPdf["topmostSubform[0].Page1[0].Noms2[0]"] = usager.nom;

      this.infosPdf["topmostSubform[0].Page1[0].Prénoms2[0]"] = usager.prenom;

      this.infosPdf[
        "topmostSubform[0].Page1[0].JourValidité1[0]"
      ] = this.dateDebut.jour;

      this.infosPdf[
        "topmostSubform[0].Page1[0].MoisValidité1[0]"
      ] = this.dateDebut.mois;

      this.infosPdf[
        "topmostSubform[0].Page1[0].AnnéeValidité1[0]"
      ] = this.dateDebut.annee;

      this.infosPdf[
        "topmostSubform[0].Page1[0].JourValidité2[0]"
      ] = this.dateFin.jour;

      this.infosPdf[
        "topmostSubform[0].Page1[0].MoisValidité2[0]"
      ] = this.dateFin.mois;

      this.infosPdf[
        "topmostSubform[0].Page1[0].AnnéeValidité2[0]"
      ] = this.dateFin.annee;

      this.infosPdf[
        "topmostSubform[0].Page1[0].JourPremiereDomic[0]"
      ] = this.datePremiereDom.jour;

      this.infosPdf[
        "topmostSubform[0].Page1[0].MoisPremiereDomic[0]"
      ] = this.datePremiereDom.mois;

      this.infosPdf[
        "topmostSubform[0].Page1[0].AnneePremiereDomic[0]"
      ] = this.datePremiereDom.annee;
    } else {
      pdfForm = "../../ressources/demande.pdf";

      this.infosPdf["topmostSubform[0].Page1[0].téléphone[0]"] = usager.phone;

      this.infosPdf["topmostSubform[0].Page1[0].Courriel[0]"] = usager.email;

      this.infosPdf["topmostSubform[0].Page1[0].Groupe_de_boutons_radio[0]"] =
        usager.typeDom === "RENOUVELLEMENT" ? "2" : "1";

      this.infosPdf[
        "topmostSubform[0].Page1[0].LieuNaissance[1]"
      ] = usager.id.toString();

      this.infosPdf["topmostSubform[0].Page2[0].Mme-Monsieur2[0]"] = sexe;

      this.infosPdf["topmostSubform[0].Page2[0].NomsDemandeur[0]"] = usager.nom;

      this.infosPdf["topmostSubform[0].Page2[0].PrénomsDemandeur[0]"] =
        usager.prenom;

      this.infosPdf[
        "topmostSubform[0].Page2[0].JourNaissanceDemandeur[0]"
      ] = this.dateNaissance.jour;

      this.infosPdf[
        "topmostSubform[0].Page2[0].MoisNaissanceDemandeur[0]"
      ] = this.dateNaissance.mois;

      this.infosPdf[
        "topmostSubform[0].Page2[0].AnnéeNaissanceDemandeur[0]"
      ] = this.dateNaissance.annee;

      this.infosPdf["topmostSubform[0].Page2[0].LieuNaissanceDemandeur[0]"] =
        usager.villeNaissance;

      /* FAIT LE */
      this.infosPdf[
        "topmostSubform[0].Page1[0].FaitLeOrganisme1[0]"
      ] = this.dateDemande.jour;

      this.infosPdf[
        "topmostSubform[0].Page1[0].FaitLeOrganisme2[0]"
      ] = this.dateDemande.mois;

      this.infosPdf[
        "topmostSubform[0].Page1[0].FaitLeOrganisme3[0]"
      ] = this.dateDemande.annee;

      this.infosPdf[
        "topmostSubform[0].Page1[0].FaitLeDemandeur1[0]"
      ] = this.dateDemande.jour;

      this.infosPdf[
        "topmostSubform[0].Page1[0].FaitLeDemandeur2[0]"
      ] = this.dateDemande.mois;

      this.infosPdf[
        "topmostSubform[0].Page1[0].FaitLeDemandeur3[0]"
      ] = this.dateDemande.annee;

      this.infosPdf[
        "topmostSubform[0].Page1[0].Jourconvocation[0]"
      ] = this.dateRdv.jour;

      this.infosPdf[
        "topmostSubform[0].Page1[0].Moisconvocation[0]"
      ] = this.dateRdv.mois;

      this.infosPdf[
        "topmostSubform[0].Page1[0].Annéeconvocation[0]"
      ] = this.dateRdv.annee;

      this.infosPdf[
        "topmostSubform[0].Page1[0].Heureconvocation[0]"
      ] = this.dateRdv.hours;

      this.infosPdf[
        "topmostSubform[0].Page1[0].Minuteconvocation[0]"
      ] = this.dateRdv.minutes;

      this.infosPdf["topmostSubform[0].Page1[0].Nomdelorganisme[0]"] =
        user.structure.nom;

      this.infosPdf["topmostSubform[0].Page1[0].PréfectureayantDélivré[0]"] =
        user.structure.departement;

      this.infosPdf["topmostSubform[0].Page1[0].NumAgrement[0]"] =
        user.structure.agrement;

      this.infosPdf[
        "topmostSubform[0].Page1[0].AdressePostale[0]"
      ] = adresseStructure;

      this.infosPdf["topmostSubform[0].Page1[0].Courriel[1]"] =
        user.structure.email;

      this.infosPdf["topmostSubform[0].Page1[0].téléphone[1]"] =
        user.structure.phone;

      this.infosPdf["topmostSubform[0].Page1[0].EntretienAvec[0]"] =
        usager.rdv.userName;

      this.infosPdf[
        "topmostSubform[0].Page1[0].EntretienAdresse[0]"
      ] = adresseStructure;

      if (usager.decision.statut === "REFUS") {
        this.infosPdf["topmostSubform[0].Page2[0].Décision[0]"] = "2";

        this.infosPdf["topmostSubform[0].Page2[0].MotifRefus[0]"] = this.motif;

        this.infosPdf[
          "topmostSubform[0].Page2[0].OrientationProposée[0]"
        ] = usager.decision.orientationDetails.toString();
      }
    }

    return pdftk
      .input(fs.readFileSync(path.resolve(__dirname, pdfForm)))
      .fillForm(this.infosPdf)
      .output();
  }

  public convertDate(date: any) {
    if (date !== null && date !== undefined && date !== "") {
      return {
        annee: date.getFullYear().toString(),
        hours: date.getHours().toString(),
        jour:
          date.getDate() < 10
            ? "0" + date.getDate().toString()
            : date.getDate().toString(),
        minutes: date.getMinutes().toString(),
        mois:
          date.getMonth() < 9
            ? "0" + (date.getMonth() + 1).toString()
            : (date.getMonth() + 1).toString()
      };
    }
    return {
      annee: "",
      hours: "",
      jour: "",
      minutes: "",
      mois: ""
    };
  }
}
