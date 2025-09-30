import { isNil } from "lodash";
import { CerfaTypeDom, getAddress, getAyantsDroit, getDateForCerfa } from ".";

import { getPhoneString } from "../../../util/phone/phoneUtils.service";
import { UserStructureAuthenticated } from "../../../_common/model";

import { Usager, CerfaDocType, generateMotifLabel } from "@domifa/common";

import { getUsagerRef } from "./get-usager-ref";
import { UsagerCerfaFields } from "../../constants/cerfa";
import { getDecisionDate } from "./get-decision-date";
import { appLogger, getStringFromData } from "../../../util";

export const generateCerfaData = (
  usager: Usager,
  user: UserStructureAuthenticated,
  typeCerfa: CerfaDocType,
  decisionUuid?: string
): UsagerCerfaFields => {
  const usagerRef = getUsagerRef(usager);

  if (isNil(usager.rdv)) {
    usager.rdv = { userId: null, dateRdv: null, userName: null };
  }
  const entretienAvec = getStringFromData(usager.rdv.userName).toUpperCase();
  const dateRdv = getDateForCerfa(usager.rdv.dateRdv, user);
  const dateOfDocument = getDateForCerfa(new Date());

  let decisionToUse = usager.decision;

  if (decisionUuid) {
    const decisionFromHistory = usager.historique.find(
      (decision) => decision.uuid === decisionUuid
    );

    if (decisionFromHistory) {
      decisionToUse = decisionFromHistory;
    } else {
      appLogger.warn(`Decision not found: ${decisionUuid}`);
      throw new Error("CERFA_INDEX_UNDEFINED");
    }
  }

  const { datePremiereDom, dateDebut, dateFin } = getDecisionDate(
    typeCerfa,
    usager,
    decisionToUse
  );

  usager.villeNaissance = usager.villeNaissance.toUpperCase();
  usager.prenom = usager.prenom.toUpperCase();
  usager.nom = usager.nom.toUpperCase();

  // Nom d'épouse à afficher sur le Cerfa
  if (user.structure.options?.surnom && usager.surnom) {
    usager.nom += ` (${usager.surnom})`;
  }

  const dateNaissance = getDateForCerfa(usager.dateNaissance);
  const sexe = usager.sexe === "femme" ? "1" : "2";
  const courriel = getStringFromData(usager.email);
  const responsable = `${user.structure.responsable.nom.toUpperCase()}, ${user.structure.responsable.prenom.toUpperCase()}, ${user.structure.responsable.fonction.toUpperCase()}`;

  const { adresseDomicilie, adresseStructure } = getAddress(user, usager);

  const prefecture =
    user.structure.structureType === "asso" ? user.structure.departement : "";

  const rattachement = getStringFromData(
    usager.entretien.rattachement
  ).toUpperCase();

  const motif =
    decisionToUse.statut === "REFUS" ? generateMotifLabel(decisionToUse) : "";

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
    ayantsDroits: getAyantsDroit(usager),
    courriel,
    courrielOrga: user.structure.email,
    decision: decisionToUse.statut === "REFUS" ? "2" : "",
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
    orientation: isNil(decisionToUse.orientationDetails)
      ? ""
      : decisionToUse.orientationDetails ?? "",
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
    typeDemande:
      decisionToUse.typeDom === "RENOUVELLEMENT"
        ? CerfaTypeDom.RENOUVELLEMENT
        : CerfaTypeDom.PREMIERE_DEMANDE,
  };
};
