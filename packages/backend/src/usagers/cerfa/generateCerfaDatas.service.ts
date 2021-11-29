import moment = require("moment");
import { generateDateForCerfa } from ".";
import {
  Usager,
  UserStructureAuthenticated,
  UsagerCerfaFields,
  CerfaDocType,
  DateCerfa,
} from "../../_common/model";
import { generateMotifLabel } from "../services";

const isNil = (value: any): boolean => {
  return value === null || value === undefined;
};

const toString = (value: any): string => {
  return value === undefined || value === null ? "" : value.toString();
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

export const generateCerfaDatas = (
  usager: Usager,
  user: UserStructureAuthenticated,
  typeCerfa: CerfaDocType
): UsagerCerfaFields => {
  let usagerRef = toString(usager.ref);
  if (!isNil(usagerRef)) {
    usagerRef = toString(usager.customRef);
  }

  if (isNil(usager.rdv)) {
    usager.rdv = { userId: null, dateRdv: null, userName: null };
  }

  const entretienAvec = toString(usager.rdv.userName).toUpperCase();

  const dateNaissance = generateDateForCerfa(usager.dateNaissance);
  const dateRdv = generateDateForCerfa(usager.rdv.dateRdv);
  const dateDecision = generateDateForCerfa(usager.decision.dateDecision);
  const datePremiereDom = generateDateForCerfa(usager.datePremiereDom);

  let dateDebut = generateDateForCerfa(usager.decision.dateDebut);
  let dateFin = generateDateForCerfa(usager.decision.dateFin);

  if (
    typeCerfa === "attestation" &&
    (usager.decision.statut === "INSTRUCTION" ||
      usager.decision.statut === "ATTENTE_DECISION")
  ) {
    dateDebut = resetDate();
    dateFin = resetDate();
  }

  usager.villeNaissance = usager.villeNaissance.toUpperCase();
  usager.nom = usager.nom.toUpperCase();
  usager.prenom = usager.prenom.toUpperCase();

  const responsable = `${user.structure.responsable.nom.toUpperCase()}, ${user.structure.responsable.prenom.toUpperCase()}, ${user.structure.responsable.fonction.toUpperCase()}`;

  // Adresse de la structure
  let adresseStructure = `${user.structure.nom}\n${user.structure.adresse}`;
  if (!isNil(user.structure.complementAdresse)) {
    adresseStructure += `\n${user.structure.complementAdresse}`;
  }
  adresseStructure += `\n${user.structure.codePostal} - ${user.structure.ville}`;

  // Adresse de courrier
  let adresseDomicilie = adresseStructure;
  if (
    !isNil(user.structure.adresseCourrier) &&
    user.structure.adresseCourrier.actif
  ) {
    adresseDomicilie = `${user.structure.nom}\n${user.structure.adresseCourrier.adresse}\n${user.structure.adresseCourrier.codePostal} - ${user.structure.adresseCourrier.ville}`;
  }

  // Numéro de boite
  if (user.structure.options.numeroBoite === true) {
    adresseDomicilie = `Boite ${usagerRef}\n${adresseDomicilie}`;
  }

  // Ayants-droits
  let ayantsDroitsTexte = usager.ayantsDroits.reduce(
    (prev, current) =>
      `${prev}${current.nom} ${current.prenom} né(e) le ${moment(
        current.dateNaissance
      )
        .locale("fr")
        .format("L")} - `,
    ""
  );

  if (ayantsDroitsTexte) {
    ayantsDroitsTexte = ayantsDroitsTexte
      .substring(0, ayantsDroitsTexte.length - 2)
      .trim();
  }

  const sexe = usager.sexe === "femme" ? "1" : "2";
  const rattachement = toString(usager.entretien.rattachement).toUpperCase();
  const motif =
    usager.decision.statut === "REFUS"
      ? generateMotifLabel(usager.decision)
      : "";
  const courriel = toString(usager.email);

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
    courriel,
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
    orientation: isNil(usager.decision.orientationDetails)
      ? ""
      : usager.decision.orientationDetails,
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
    telephone: toString(usager.phone),
    telephoneOrga: toString(user.structure.phone),
    typeDemande: usager.typeDom === "RENOUVELLEMENT" ? "2" : "1",
  };
  return pdfInfos;
};
