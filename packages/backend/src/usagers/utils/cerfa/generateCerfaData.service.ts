import { isNil } from "lodash";
import { format } from "date-fns";
import { generateDateForCerfa } from ".";

import { getPhoneString } from "../../../util/phone/phoneUtils.service";
import { UserStructureAuthenticated } from "../../../_common/model";

import {
  Usager,
  CerfaDocType,
  UsagerAyantDroit,
  generateMotifLabel,
} from "@domifa/common";

import { getUsagerRef } from "./cerfa-utils";
import { UsagerCerfaFields } from "../../constants/cerfa";
import { getDecisionDate } from "./get-decision-date";
import { getStringFromData } from "../../../util";

export const generateCerfaData = (
  usager: Usager,
  user: UserStructureAuthenticated,
  typeCerfa: CerfaDocType
): UsagerCerfaFields => {
  const usagerRef = getUsagerRef(usager);

  if (isNil(usager.rdv)) {
    usager.rdv = { userId: null, dateRdv: null, userName: null };
  }
  const entretienAvec = getStringFromData(usager.rdv.userName).toUpperCase();
  const dateRdv = generateDateForCerfa(usager.rdv.dateRdv, user);

  const dateOfDocument = generateDateForCerfa(new Date());

  const { datePremiereDom, dateDebut, dateFin } = getDecisionDate(
    typeCerfa,
    usager
  );

  usager.villeNaissance = usager.villeNaissance.toUpperCase();
  usager.prenom = usager.prenom.toUpperCase();
  usager.nom = usager.nom.toUpperCase();

  // Nom d'épouse à afficher sur le Cerfa
  if (user.structure.options?.surnom && usager.surnom) {
    usager.nom += ` (${usager.surnom})`;
  }

  const dateNaissance = generateDateForCerfa(usager.dateNaissance);
  const sexe = usager.sexe === "femme" ? "1" : "2";
  const courriel = getStringFromData(usager.email);
  const responsable = `${user.structure.responsable.nom.toUpperCase()}, ${user.structure.responsable.prenom.toUpperCase()}, ${user.structure.responsable.fonction.toUpperCase()}`;

  const { adresseDomicilie, adresseStructure } = generateAdressForCerfa(
    user,
    usager
  );

  const prefecture =
    user.structure.structureType === "asso" ? user.structure.departement : "";

  const rattachement = getStringFromData(
    usager.entretien.rattachement
  ).toUpperCase();

  const motif =
    usager.decision.statut === "REFUS"
      ? generateMotifLabel(usager.decision)
      : "";

  return {
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
};

export function getAyantsDroitsText(usager: Usager): string {
  let ayantsDroitsTexte = "";

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
    ? `\n${usager.numeroDistribution}\n`
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
      adresseDomicilie += `\n${user.structure.complementAdresse}`;
    }
    // Numéro de distribution spéciale
    adresseDomicilie += `${numeroDistribution}${user.structure.codePostal} - ${user.structure.ville}`;
  }

  const adresseStructure = `${user.structure.adresse}\n${user.structure.codePostal} - ${user.structure.ville}`;

  // Numéro de boite au lettre
  if (user.structure.options?.numeroBoite) {
    adresseDomicilie = `Boite ${getUsagerRef(usager)}\n${adresseDomicilie}`;
  }

  return { adresseStructure, adresseDomicilie };
}
