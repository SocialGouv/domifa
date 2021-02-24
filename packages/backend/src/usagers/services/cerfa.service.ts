import { HttpException, HttpStatus, Injectable } from "@nestjs/common";
import * as fs from "fs";
import * as path from "path";
import { UsagerPG } from "../../database";
import { UsagerCerfaFields } from "../../database/entities/usager/UsagerCerfaFields.type";
import { appLogger } from "../../util";
import { AppAuthUser } from "../../_common/model";
import { DateCerfa } from "../interfaces/date-cerfa";

// tslint:disable-next-line: no-var-requires
const pdftk = require("node-pdftk");

@Injectable()
export class CerfaService {
  public motifsRefus: {
    [key: string]: string;
  };

  constructor() {
    this.motifsRefus = {
      HORS_AGREMENT: "En dehors des critères du public domicilié",
      LIEN_COMMUNE: "Absence de lien avec la commune",
      SATURATION: "Nombre maximal domiciliations atteint",
    };
  }

  public async attestation(usager: UsagerPG, user: AppAuthUser) {
    const pdfForm =
      usager.decision.statut === "VALIDE"
        ? "../../ressources/attestation.pdf"
        : "../../ressources/demande.pdf";

    let usagerRef = this.toString(usager.ref);

    if (usager.customRef && usager.customRef !== null) {
      usagerRef = this.toString(usager.customRef);
    }

    if (!usager.rdv) {
      usager.rdv = {
        userId: null,
        dateRdv: null,
        userName: null,
      };
    }

    const entretienAvec = usager.rdv.userName
      ? usager.rdv.userName.toUpperCase()
      : "";

    const dateNaissance = new DateCerfa(usager.dateNaissance);

    const dateRdv = new DateCerfa(usager.rdv.dateRdv);

    const dateDecision = new DateCerfa(usager.decision.dateDecision);

    const datePremiereDom = new DateCerfa(usager.datePremiereDom);

    const dateDebut = new DateCerfa(usager.decision.dateDebut);

    const dateFin = new DateCerfa(usager.decision.dateFin);

    usager.villeNaissance = usager.villeNaissance.toUpperCase();
    usager.nom = usager.nom.toUpperCase();
    usager.prenom = usager.prenom.toUpperCase();

    //
    // NOM DU RESPONSABLE
    const responsable =
      user.structure.responsable.nom.toUpperCase() +
      ", " +
      user.structure.responsable.prenom.toUpperCase() +
      ", " +
      user.structure.responsable.fonction.toUpperCase();

    let adresseStructure = user.structure.nom + "\n" + user.structure.adresse;

    if (user.structure.complementAdresse) {
      adresseStructure =
        adresseStructure + "\n" + user.structure.complementAdresse;
    }

    adresseStructure =
      adresseStructure +
      "\n" +
      user.structure.codePostal +
      " - " +
      user.structure.ville;

    //
    // ADRESSE DE RECEPTION DU COURRIER (optionnel)
    let adresseDomicilie = adresseStructure;

    if (user.structure.adresseCourrier) {
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

    //
    // NUMERO DE BOITE POSTALE ACTIF
    if (user.structure.options.numeroBoite === true) {
      adresseDomicilie = "Boite " + usagerRef + "\n" + adresseDomicilie;
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
      if (usager.decision.motif === "AUTRE") {
        motif = usager.decision.motifDetails
          ? "Autre motif : " + usager.decision.motifDetails
          : "Autre motif non précisé";
      } else {
        motif = this.motifsRefus[usager.decision.motif];
      }
    }

    const pdfInfos: UsagerCerfaFields = {
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
      entretienAvec,
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
      numeroUsager: usagerRef,
      orientation: this.toString(usager.decision.orientationDetails),
      prefecture1: user.structure.departement,
      prefecture2: user.structure.departement,
      prenoms1: usager.prenom,
      prenoms2: usager.prenom,
      rattachement,
      responsable,
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
      .fillForm(pdfInfos)
      .output()
      .then((buffer: any) => {
        return buffer;
      })
      .catch((err: any) => {
        appLogger.error(
          `CERFA ERROR structure : ${user.structureId} / usager :${usagerRef} `,
          {
            sentry: true,
            extra: pdfInfos,
          }
        );
        throw new HttpException(
          {
            err,
            message: "CERFA_ERROR",
          },
          HttpStatus.INTERNAL_SERVER_ERROR
        );
      });
  }

  private toString(value: any) {
    return value === undefined || value === null ? "" : value.toString();
  }
}
