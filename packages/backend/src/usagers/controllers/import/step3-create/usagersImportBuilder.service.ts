import { setHours } from "date-fns";
import { v4 as uuidv4 } from "uuid";

import { UsagersImportUsager } from "../step2-validate-row/schema";
import {
  UsagerDecisionMotif,
  UsagerEntretien,
  ETAPE_DOSSIER_COMPLET,
  UsagerAyantDroit,
  UsagerDecision,
  Usager,
  UserStructure,
} from "@domifa/common";

export const usagersImportBuilder = {
  buildUsagers,
};

function buildUsagers({
  usagersRows,
  user,
}: {
  usagersRows: UsagersImportUsager[];
  user: Pick<UserStructure, "id" | "structureId" | "prenom" | "nom">;
}): Partial<Usager>[] {
  const now = new Date();
  const agent = `${user.prenom} ${user.nom}`;

  return usagersRows.map((usagerRow) =>
    buildUsager({
      usagerRow,
      now,
      agent,
      user,
    })
  );
}

function buildUsager({
  usagerRow,
  now,
  agent,
  user,
}: {
  usagerRow: UsagersImportUsager;
  now: Date;
  agent: string;
  user: Pick<UserStructure, "id" | "structureId">;
}) {
  const sexe = usagerRow.civilite === "H" ? "homme" : "femme";
  let motif: UsagerDecisionMotif;

  //
  // Partie ENTRETIEN
  //
  const entretien: UsagerEntretien = buildEntretien(
    usagerRow
  ) as UsagerEntretien;
  const ayantsDroits = buildAyantsDroits(usagerRow);

  const customRef = usagerRow.customRef;
  const telephone = {
    countryCode: usagerRow.telephone.countryCode,
    numero: usagerRow.telephone.numero.replace(/\s+/g, ""),
  };
  const email = usagerRow.email;

  //
  // Dates
  //
  let datePremiereDom = usagerRow.datePremiereDom
    ? usagerRow.datePremiereDom
    : null;
  let dateDecision = null;
  let dernierPassage = null;

  const dateFin = usagerRow.dateFinDom;
  let dateDebut = usagerRow.dateDebutDom;

  if (usagerRow.statutDom === "REFUS" || usagerRow.statutDom === "RADIE") {
    dateDebut = usagerRow.dateFinDom;
    dateDecision = usagerRow.dateFinDom;
  }

  if (usagerRow.statutDom === "REFUS") {
    motif = usagerRow.motifRefus ?? "AUTRE";
  }

  if (usagerRow.statutDom === "RADIE") {
    motif = usagerRow.motifRadiation ?? "AUTRE";
  }

  if (usagerRow.statutDom === "VALIDE") {
    dernierPassage = usagerRow?.dateDernierPassage
      ? setHours(new Date(usagerRow.dateDernierPassage), 19)
      : now;

    dateDecision = usagerRow.dateDebutDom;
    // Valide uniquement avec date de début
    if (datePremiereDom === null && usagerRow.dateDebutDom) {
      datePremiereDom = usagerRow.dateDebutDom;
    }
  }

  const dateDerniereDom =
    usagerRow.statutDom === "RADIE" || usagerRow.statutDom === "REFUS"
      ? null
      : datePremiereDom;

  if (usagerRow.typeDom === "PREMIERE") {
    usagerRow.typeDom = "PREMIERE_DOM";
  }

  const decision: UsagerDecision = {
    uuid: uuidv4(),
    dateDebut,
    dateDecision,
    dateFin,
    motif,
    motifDetails: null,
    typeDom: usagerRow.typeDom,
    statut: usagerRow.statutDom,
    userId: user.id,
    userName: agent,
  };

  // Enregistrement
  const usager: Partial<Usager> = {
    ayantsDroits,
    customRef,
    dateNaissance: usagerRow.dateNaissance,
    datePremiereDom,
    dateDerniereDom,
    import: {
      date: new Date(),
      userId: user.id,
      userName: agent,
    },
    statut: decision.statut,
    decision,
    lastInteraction: {
      dateInteraction: dernierPassage,
      colisIn: 0,
      courrierIn: 0,
      recommandeIn: 0,
      enAttente: false,
    },
    email,
    entretien,
    etapeDemande: ETAPE_DOSSIER_COMPLET,
    historique: [decision],
    nom: usagerRow.nom,
    telephone,
    prenom: usagerRow.prenom,
    sexe,
    structureId: user.structureId,
    surnom: usagerRow.surnom,
    typeDom: usagerRow.typeDom,
    villeNaissance: usagerRow.lieuNaissance,
  };

  return usager;
}
function buildAyantsDroits(usagerRow): UsagerAyantDroit[] {
  return usagerRow.ayantsDroits.map((ad) => {
    const ayantDroit: UsagerAyantDroit = {
      dateNaissance: ad.dateNaissance,
      lien: ad.lienParente,
      nom: ad.nom,
      prenom: ad.prenom,
    };
    return ayantDroit;
  });
}

function buildEntretien(usagerRow): Partial<UsagerEntretien> {
  const entretien: Partial<UsagerEntretien> = {};

  entretien.commentaires = usagerRow.commentaires ?? null;
  entretien.domiciliation = usagerRow.domiciliationExistante ?? null;
  entretien.typeMenage = usagerRow.typeMenage ?? null;

  entretien.accompagnement = usagerRow.accompagnement;
  entretien.accompagnementDetail =
    usagerRow.accompagnement === true
      ? usagerRow.accompagnementDetail ?? null
      : null;

  entretien.situationPro = usagerRow.situationPro ?? null;
  entretien.situationProDetail =
    usagerRow.situationPro === "AUTRE"
      ? usagerRow.situationProDetail ?? null
      : null;

  entretien.revenus = usagerRow.revenus;
  entretien.revenusDetail =
    usagerRow.revenus === true ? usagerRow.revenusDetail ?? null : null;

  entretien.liencommune = usagerRow.liencommune;
  entretien.liencommuneDetail =
    usagerRow.liencommune === "AUTRE"
      ? usagerRow.liencommuneDetail ?? null
      : null;

  entretien.residence = usagerRow.residence ?? null;
  entretien.residenceDetail =
    usagerRow.residence === "AUTRE" ? usagerRow.residenceDetail ?? null : null;

  entretien.orientation = usagerRow.orientation;
  entretien.orientationDetail =
    usagerRow.orientation === true ? usagerRow.orientationDetail ?? null : null;

  entretien.raison = usagerRow.raisonDemande ?? null;
  entretien.raisonDetail =
    usagerRow.raisonDemande === "AUTRE"
      ? usagerRow.raisonDemandeDetail ?? null
      : null;

  entretien.cause = usagerRow.causeInstabilite ?? null;
  entretien.causeDetail =
    usagerRow.causeInstabilite === "AUTRE"
      ? usagerRow.causeDetail ?? null
      : null;

  return entretien;
}
