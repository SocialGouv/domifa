import { addYears, format, subDays } from "date-fns";
import { generateDateForCerfa } from ".";

import { getPhoneString } from "../../../util/phone/phoneUtils.service";
import { UserStructureAuthenticated } from "../../../_common/model";
import {
  DateCerfa,
  Usager,
  UsagerAyantDroit,
  UsagerCerfaFields,
} from "../../../_common/model/usager";
import { generateMotifLabel } from "../generateMotifLabel.service";
import { CerfaDocType } from "@domifa/common";
import { isNil } from "lodash";

export const generateCerfaDatas = (
  usager: Usager,
  user: UserStructureAuthenticated,
  typeCerfa: CerfaDocType
): UsagerCerfaFields => {
  const usagerRef = getUsagerRef(usager);

  if (isNil(usager.rdv)) {
    usager.rdv = { userId: null, dateRdv: null, userName: null };
  }
  const entretienAvec = toString(usager.rdv.userName).toUpperCase();
  const dateRdv = generateDateForCerfa(usager.rdv.dateRdv, user);

  const dateOfDocument = generateDateForCerfa(new Date());
  const datePremiereDom = generateDateForCerfa(usager.datePremiereDom);
  let dateDebut = generateDateForCerfa(usager.decision.dateDebut);
  let dateFin = generateDateForCerfa(usager.decision.dateFin);

  if (
    typeCerfa === "attestation" &&
    (usager.decision.statut === "INSTRUCTION" ||
      usager.decision.statut === "ATTENTE_DECISION")
  ) {
    const index =
      usager.decision.statut === "INSTRUCTION"
        ? usager.historique.length - 2
        : usager.historique.length - 3;

    if (usager.typeDom === "PREMIERE_DOM") {
      dateDebut = generateDateForCerfa(new Date());
      dateFin = generateDateForCerfa(subDays(addYears(new Date(), 1), 1));
    } else if (typeof usager.historique[index] !== "undefined") {
      const lastDecision = usager.historique[usager.historique.length - 2];
      dateDebut = generateDateForCerfa(lastDecision.dateDebut);
      dateFin = generateDateForCerfa(lastDecision.dateFin);
    } else {
      dateDebut = resetDate();
      dateFin = resetDate();
    }
  }

  usager.villeNaissance = usager.villeNaissance.toUpperCase();
  usager.nom = usager.nom.toUpperCase();
  usager.prenom = usager.prenom.toUpperCase();
  const dateNaissance = generateDateForCerfa(usager.dateNaissance);
  const sexe = usager.sexe === "femme" ? "1" : "2";
  const courriel = toString(usager.email);
  const responsable = `${user.structure.responsable.nom.toUpperCase()}, ${user.structure.responsable.prenom.toUpperCase()}, ${user.structure.responsable.fonction.toUpperCase()}`;

  const { adresseDomicilie, adresseStructure } = generateAdressForCerfa(
    user,
    usager
  );

  const prefecture =
    user.structure.structureType === "asso" ? user.structure.departement : "";

  const rattachement = toString(usager.entretien.rattachement).toUpperCase();
  const motif =
    usager.decision.statut === "REFUS"
      ? generateMotifLabel(usager.decision)
      : "";

  const pdfInfos: UsagerCerfaFields = {
    adresse: adresseDomicilie,
    adresseOrga1: adresseStructure,
    agrement: user.structure.agrement,
    anneeDebut: dateDebut.annee,
    anneeDecision1A: dateOfDocument.annee,
    anneeDecision1B: dateOfDocument.annee,
    anneeDecision2: dateOfDocument.annee,
    anneeFin: dateFin.annee,
    anneeNaissance1: dateNaissance.annee,
    anneeNaissance2: dateNaissance.annee,
    anneePremiereDom: datePremiereDom.annee,
    anneeRdv: dateRdv.annee,
    ayantsDroits: getAyantsDroitsText(usager),
    courriel,
    courrielOrga: user.structure.email,
    decision: usager.decision.statut === "REFUS" ? "2" : "",
    entretienAdresse: adresseStructure,
    entretienAvec,
    heureRdv: dateRdv.heure,
    jourDebut: dateDebut.jour,
    jourDecision1A: dateOfDocument.jour,
    jourDecision1B: dateOfDocument.jour,
    jourDecision2: dateOfDocument.jour,
    jourFin: dateFin.jour,
    jourNaissance1: dateNaissance.jour,
    jourNaissance2: dateNaissance.jour,
    jourPremiereDom: datePremiereDom.jour,
    jourRdv: dateRdv.jour,
    lieuNaissance1: usager.villeNaissance,
    lieuNaissance2: usager.villeNaissance,
    minutesRdv: dateRdv.minutes,
    moisDebut: dateDebut.mois,
    moisDecision1A: dateOfDocument.mois,
    moisDecision1B: dateOfDocument.mois,
    moisDecision2: dateOfDocument.mois,
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
    orientation: isNil(usager.decision.orientationDetails)
      ? ""
      : usager.decision.orientationDetails ?? "",
    prefecture1: prefecture,
    prefecture2: prefecture,
    prenoms1: usager.prenom,
    prenoms2: usager.prenom,
    rattachement,
    responsable,
    sexe1: sexe,
    sexe2: sexe,
    signature1A: user.structure.ville.toUpperCase(),
    signature1B: user.structure.ville.toUpperCase(),
    signature2: user.structure.ville.toUpperCase(),
    telephone: getPhoneString(usager.telephone),
    telephoneOrga: getPhoneString(user.structure.telephone),
    typeDemande: usager.typeDom === "RENOUVELLEMENT" ? "2" : "1",
  };
  return pdfInfos;
};

const toString = (value: any): string => {
  return typeof value === "undefined" || value === null ? "" : value.toString();
};

const resetDate = (): DateCerfa => {
  return { annee: "", heure: "", jour: "", minutes: "", mois: "" };
};

export const getUsagerRef = (usager: Usager): string => {
  let usagerRef = toString(usager.ref);
  if (!isNil(usagerRef)) {
    usagerRef = toString(usager.customRef);
  }
  return usagerRef;
};

export function getAyantsDroitsText(usager: Usager): string {
  let ayantsDroitsTexte = "";
  // Ayants-droits
  if (usager.ayantsDroits.length > 0) {
    ayantsDroitsTexte = usager.ayantsDroits.reduce(
      (prev: string, current: UsagerAyantDroit) =>
        `${prev}${current.nom} ${current.prenom} né(e) le ${format(
          new Date(current.dateNaissance),
          "dd/MM/yyyy"
        )} - `,
      ""
    );

    if (ayantsDroitsTexte) {
      ayantsDroitsTexte = ayantsDroitsTexte
        .substring(0, ayantsDroitsTexte.length - 2)
        .trim();
    }
  }
  return ayantsDroitsTexte;
}

export function generateAdressForCerfa(
  user: UserStructureAuthenticated,
  usager: Usager
): {
  adresseStructure: string;
  adresseDomicilie: string;
} {
  // Adresse de la structure
  let adresseDomicilie = "";

  const numeroDistribution = !isNil(usager.numeroDistribution)
    ? "\n" + usager.numeroDistribution + "\n"
    : "\n";

  if (
    !isNil(user.structure.adresseCourrier) &&
    user.structure.adresseCourrier.actif
  ) {
    adresseDomicilie = `${user.structure.nom}\n${user.structure.adresseCourrier.adresse}`;
    adresseDomicilie += `${numeroDistribution}${user.structure.adresseCourrier.codePostal} - ${user.structure.adresseCourrier.ville}`;
  } else {
    adresseDomicilie = `${user.structure.nom}\n${user.structure.adresse}`;

    // Complément d'adresse
    if (!isNil(user.structure.complementAdresse)) {
      adresseDomicilie += `\n----${user.structure.complementAdresse}`;
    }
    // Numéro de distribution spéciale
    adresseDomicilie += `${numeroDistribution}${user.structure.codePostal} - ${user.structure.ville}`;
  }

  const adresseStructure = `${user.structure.adresse}\n${user.structure.codePostal} - ${user.structure.ville}`;

  // Numéro de boite
  // HOTFIX en attendant d'investiguer sur l'option des structures qui n'est pas censé être à null
  if (user.structure.options?.numeroBoite === true) {
    adresseDomicilie = `Boite ${getUsagerRef(usager)}\n${adresseDomicilie}`;
  }

  return { adresseStructure, adresseDomicilie };
}
