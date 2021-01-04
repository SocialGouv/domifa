import { Injectable } from "@nestjs/common";
import * as fs from "fs";
import * as path from "path";
import { AppAuthUser } from "../../_common/model";
import { DateCerfa } from "../interfaces/date-cerfa";
import { Usager } from "../interfaces/usagers";

// tslint:disable-next-line: no-var-requires
const pdftk = require("node-pdftk");

@Injectable()
export class CerfaService {
  public infosPdf: any;

  public dateNaissance: DateCerfa;
  public dateDecision: DateCerfa;
  public dateDebut: DateCerfa;
  public dateFin: DateCerfa;
  public datePremiereDom: DateCerfa;
  public dateRdv: DateCerfa;

  public responsable: string;
  public motifsRefus: {
    [key: string]: string;
  };

  constructor() {
    this.dateNaissance = new DateCerfa();
    this.dateDecision = new DateCerfa();
    this.dateDebut = new DateCerfa();
    this.dateFin = new DateCerfa();
    this.datePremiereDom = new DateCerfa();
    this.dateRdv = new DateCerfa();

    this.responsable = "";
    this.motifsRefus = {
      AUTRE: "Autre motif : ",
      AUTRES: "Autre motif : ",
      HORS_AGREMENT: "En dehors des critères du public domicilié",
      LIEN_COMMUNE: "Absence de lien avec la commune",
      SATURATION: "Nombre maximal domiciliations atteint",
    };
  }

  public async attestation(usager: Usager, user: AppAuthUser) {
    const pdfForm =
      usager.decision.statut === "VALIDE"
        ? "../../ressources/attestation.pdf"
        : "../../ressources/demande.pdf";

    let usagerId = this.toString(usager.id);

    if (usager.customId && usager.customId !== null) {
      usagerId = this.toString(usager.customId);
    }

    this.dateNaissance = new DateCerfa(usager.dateNaissance);
    this.dateRdv = new DateCerfa(usager.rdv.dateRdv);
    this.dateDecision = new DateCerfa(usager.decision.dateDecision);
    this.datePremiereDom = new DateCerfa(usager.datePremiereDom);
    this.dateDebut = new DateCerfa(usager.decision.dateDebut);
    this.dateFin = new DateCerfa(usager.decision.dateFin);

    usager.villeNaissance = usager.villeNaissance.toUpperCase();
    usager.nom = usager.nom.toUpperCase();
    usager.prenom = usager.prenom.toUpperCase();

    this.responsable =
      user.structure.responsable.nom.toUpperCase() +
      ", " +
      user.structure.responsable.prenom.toUpperCase() +
      ", " +
      user.structure.responsable.fonction.toUpperCase();

    const adresseStructure =
      user.structure.nom +
      "\n" +
      user.structure.adresse +
      (user.structure.complementAdresse !== ""
        ? "\n" + user.structure.complementAdresse
        : "") +
      "\n" +
      user.structure.codePostal +
      " - " +
      user.structure.ville;

    // Adresse différente
    let adresseDomicilie = adresseStructure;

    if (user.structure.adresseCourrier.actif) {
      adresseDomicilie =
        user.structure.nom +
        "\n" +
        user.structure.adresseCourrier.adresse +
        "\n" +
        user.structure.adresseCourrier.codePostal +
        " - " +
        user.structure.adresseCourrier.ville;
    }

    if (user.structure.options.numeroBoite === true) {
      adresseDomicilie = "Boite " + usagerId + "\n" + adresseDomicilie;
    }

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

    const rattachement = this.toString(
      usager.entretien.rattachement
    ).toUpperCase();

    let motif = "";

    if (usager.decision.statut === "REFUS") {
      if (
        usager.decision.motif === "AUTRE" ||
        usager.decision.motif === "AUTRES"
      ) {
        motif = usager.decision.motifDetails
          ? "Autre motif : " + usager.decision.motifDetails
          : "Autre motif non précisé";
      } else {
        motif = this.motifsRefus[usager.decision.motif];
      }
    }

    this.infosPdf = {
      adresse: adresseDomicilie,
      adresseOrga1: adresseStructure,
      agrement: user.structure.agrement,
      anneeDebut: this.dateDebut.annee,
      anneeDecision1A: this.dateDecision.annee,
      anneeDecision1B: this.dateDecision.annee,
      anneeDecision2: this.dateDecision.annee,
      anneeFin: this.dateFin.annee,
      anneeNaissance1: this.dateNaissance.annee,
      anneeNaissance2: this.dateNaissance.annee,
      anneePremiereDom: this.datePremiereDom.annee,
      anneeRdv: this.dateRdv.annee,
      ayantsDroits: ayantsDroitsTexte,
      courriel: usager.email,
      courrielOrga: user.structure.email,
      decision: usager.decision.statut === "REFUS" ? "2" : "",
      entretienAdresse: adresseStructure,
      entretienAvec: usager.rdv.userName.toUpperCase(),
      heureRdv: this.dateRdv.heure,
      jourDebut: this.dateDebut.jour,
      jourDecision1A: this.dateDecision.jour,
      jourDecision1B: this.dateDecision.jour,
      jourDecision2: this.dateDecision.jour,
      jourFin: this.dateFin.jour,
      jourNaissance1: this.dateNaissance.jour,
      jourNaissance2: this.dateNaissance.jour,
      jourPremiereDom: this.datePremiereDom.jour,
      jourRdv: this.dateRdv.jour,
      lieuNaissance1: usager.villeNaissance,
      lieuNaissance2: usager.villeNaissance,
      minutesRdv: this.dateRdv.minutes,
      moisDebut: this.dateDebut.mois,
      moisDecision1A: this.dateDecision.mois,
      moisDecision1B: this.dateDecision.mois,
      moisDecision2: this.dateDecision.mois,
      moisFin: this.dateFin.mois,
      moisNaissance1: this.dateNaissance.mois,
      moisNaissance2: this.dateNaissance.mois,
      moisPremiereDom: this.datePremiereDom.mois,
      moisRdv: this.dateRdv.mois,
      motifRefus: motif,
      nomOrga1: user.structure.nom.toUpperCase(),
      nomOrga2: user.structure.nom.toUpperCase(),
      noms1: usager.nom,
      noms2: usager.nom,
      numeroUsager: usagerId,
      orientation: this.toString(usager.decision.orientationDetails),
      prefecture1: user.structure.departement,
      prefecture2: user.structure.departement,
      prenoms1: usager.prenom,
      prenoms2: usager.prenom,
      rattachement,
      responsable: this.responsable,
      sexe1: sexe,
      sexe2: sexe,
      signature1A: user.structure.ville.toUpperCase(),
      signature1B: user.structure.ville.toUpperCase(),
      signature2: user.structure.ville.toUpperCase(),

      telephone: this.toString(usager.phone),
      telephoneOrga: this.toString(user.structure.phone),
      typeDemande: usager.typeDom === "RENOUVELLEMENT" ? "2" : "1",
    };

    return pdftk
      .input(fs.readFileSync(path.resolve(__dirname, pdfForm)))
      .fillForm(this.infosPdf)
      .output();
  }

  private toString(value: any) {
    return value === undefined || value === null ? "" : value.toString();
  }
}
