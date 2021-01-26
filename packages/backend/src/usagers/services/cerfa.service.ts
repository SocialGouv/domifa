import * as fs from "fs";
import * as path from "path";

import { Injectable } from "@nestjs/common";

import { motifsRefus } from "../../stats/usagers.labels";
import { AppAuthUser } from "../../_common/model";
import { DateCerfa } from "../interfaces/date-cerfa";
import { Usager } from "../interfaces/usagers";
import { CerfaFields } from "../CerfaFields.type";

// tslint:disable-next-line: no-var-requires
const pdftk = require("node-pdftk");

@Injectable()
export class CerfaService {
  public infosPdf: CerfaFields;

  constructor() {}

  public async attestation(usager: Usager, user: AppAuthUser) {
    const pdfForm =
      usager.decision.statut === "VALIDE"
        ? "../../ressources/attestation.pdf"
        : "../../ressources/demande.pdf";

    // DATES AU FORMAT
    const dateNaissance = new DateCerfa(usager.dateNaissance);
    const dateRdv = new DateCerfa(usager.rdv.dateRdv);
    const dateDecision = new DateCerfa(usager.decision.dateDecision);
    const datePremiereDom = new DateCerfa(usager.datePremiereDom);
    const dateDebut = new DateCerfa(usager.decision.dateDebut);
    const dateFin = new DateCerfa(usager.decision.dateFin);

    // INFOS
    let usagerId = this.toString(usager.id);
    if (usager.customId && usager.customId !== null) {
      usagerId = this.toString(usager.customId);
    }

    usager.nom = usager.nom.toUpperCase();
    usager.prenom = usager.prenom.toUpperCase();
    usager.villeNaissance = usager.villeNaissance.toUpperCase();
    usager.sexe = usager.sexe === "femme" ? "1" : "2";

    // INFOS STRUCTURE
    const responsable =
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

    if (user.structure.adresseCourrier !== null) {
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
    }

    // Numéro de boite
    if (user.structure.options.numeroBoite === true) {
      adresseDomicilie = "Boite " + usagerId + "\n" + adresseDomicilie;
    }

    // AYANTS-DROITS
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

    // RATTACHEMENT COMMUNE
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
        motif = motifsRefus[usager.decision.motif];
      }
    }

    this.infosPdf = {
      adresse: adresseDomicilie,
      adresseOrga1: adresseStructure,
      agrement: user.structure.agrement,
      anneeDebut: dateDebut.annee,
      anneeDecision1A: dateDecision.annee,
      anneeDecision1B: dateDecision.annee,
      anneeDecision2: dateDecision.annee,
      anneeFin: dateFin.annee,
      anneeNaissance1: dateNaissance.annee,
      anneeNaissance2: dateNaissance.annee,
      anneePremiereDom: datePremiereDom.annee,
      anneeRdv: dateRdv.annee,
      ayantsDroits: ayantsDroitsTexte,
      courriel: usager.email,
      courrielOrga: user.structure.email,
      decision: usager.decision.statut === "REFUS" ? "2" : "",
      entretienAdresse: adresseStructure,
      entretienAvec: usager.rdv.userName.toUpperCase(),
      heureRdv: dateRdv.heure,
      jourDebut: dateDebut.jour,
      jourDecision1A: dateDecision.jour,
      jourDecision1B: dateDecision.jour,
      jourDecision2: dateDecision.jour,
      jourFin: dateFin.jour,
      jourNaissance1: dateNaissance.jour,
      jourNaissance2: dateNaissance.jour,
      jourPremiereDom: datePremiereDom.jour,
      jourRdv: dateRdv.jour,
      lieuNaissance1: usager.villeNaissance,
      lieuNaissance2: usager.villeNaissance,
      minutesRdv: dateRdv.minutes,
      moisDebut: dateDebut.mois,
      moisDecision1A: dateDecision.mois,
      moisDecision1B: dateDecision.mois,
      moisDecision2: dateDecision.mois,
      moisFin: dateFin.mois,
      moisNaissance1: dateNaissance.mois,
      moisNaissance2: dateNaissance.mois,
      moisPremiereDom: datePremiereDom.mois,
      moisRdv: dateRdv.mois,
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
      responsable,
      sexe1: usager.sexe,
      sexe2: usager.sexe,
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
