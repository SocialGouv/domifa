import { setHours } from "date-fns";

import { Usager, UserStructure } from "../../../../_common/model";
import { v4 as uuidv4 } from "uuid";

import { UsagersImportUsager } from "../step2-validate-row/schema";
import {
  UsagerDecisionMotif,
  UsagerEntretien,
  ETAPE_DOSSIER_COMPLET,
  UsagerAyantDroit,
  UsagerDecision,
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
  const agent = user.prenom + " " + user.nom;

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
  const telephone = usagerRow.telephone;
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
    import: {
      date: new Date(),
      userId: user.id,
      userName: agent,
    },
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
  if (usagerRow.accompagnement) {
    entretien.accompagnementDetail = usagerRow.accompagnementDetail;
  }

  entretien.situationPro = usagerRow.situationPro ?? null;
  if (usagerRow?.situationPro && usagerRow?.situationProDetail) {
    entretien.situationProDetail = usagerRow.situationProDetail;
  }

  entretien.revenus = usagerRow.revenus;
  if (usagerRow?.revenus && usagerRow?.revenusDetail) {
    entretien.revenusDetail = usagerRow.revenusDetail;
  }

  entretien.liencommune = usagerRow.liencommune;
  if (usagerRow?.liencommune && usagerRow?.liencommuneDetail) {
    entretien.liencommuneDetail = usagerRow.liencommuneDetail;
  }

  entretien.residence = usagerRow.residence ?? null;
  if (usagerRow?.residence && usagerRow?.residenceDetaildentielle) {
    entretien.residenceDetail = usagerRow.residenceDetail;
  }

  entretien.orientation = usagerRow.orientation;
  if (usagerRow?.orientation && usagerRow?.orientationDetail) {
    entretien.orientationDetail = usagerRow.orientationDetail;
  }

  entretien.raison = usagerRow.raisonDemande ?? null;
  if (usagerRow?.raisonDemande && usagerRow?.raisonDemandeDetail) {
    entretien.raisonDetail = usagerRow.raisonDemandeDetail;
  }

  entretien.cause = usagerRow.causeInstabilite ?? null;
  if (usagerRow?.causeInst && usagerRow?.causeDetailabilite) {
    entretien.causeDetail = usagerRow.causeDetail;
  }
  return entretien;
}
