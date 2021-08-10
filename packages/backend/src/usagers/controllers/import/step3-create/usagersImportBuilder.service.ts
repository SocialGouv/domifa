import moment = require("moment");
import { uuidGenerator } from "../../../../database/services/uuid";
import {
  AppUser,
  Usager,
  UsagerAyantDroit,
  UsagerDecision,
} from "../../../../_common/model";
import { UsagerEntretien } from "../../../../_common/model/usager/entretien";
import { ETAPE_DOSSIER_COMPLET } from "../../../../_common/model/usager/ETAPES_DEMANDE.const";
import { UsagerDecisionMotif } from "../../../../_common/model/usager/UsagerDecisionMotif.type";

import { UsagersImportUsager } from "../step2-validate-row/schema";

export const usagersImportBuilder = {
  buildUsagers,
};

function buildUsagers({
  usagersRows,
  user,
}: {
  usagersRows: UsagersImportUsager[];
  user: Pick<AppUser, "id" | "structureId" | "prenom" | "nom">;
}): Partial<Usager>[] {
  const now = moment().toDate();
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
  user: Pick<AppUser, "id" | "structureId">;
}) {
  const sexe = usagerRow.civilite === "H" ? "homme" : "femme";
  let motif: UsagerDecisionMotif;

  // Partie STATUT + HISTORIQUE
  //
  let datePremiereDom = now;
  let dateDecision = usagerRow.dateDebutDom ?? now;

  //
  // Partie ENTRETIEN
  //
  const entretien: UsagerEntretien = buildEntretien(usagerRow);
  const ayantsDroits = buildAyantsDroits(usagerRow);

  if (usagerRow.datePremiereDom) {
    datePremiereDom = usagerRow.datePremiereDom;
  } else if (usagerRow.dateDebutDom) {
    datePremiereDom = usagerRow.dateDebutDom;
  }

  const customRef = usagerRow.customId;

  const phone = usagerRow.phone;

  const email = usagerRow.email;

  //
  // Dates
  //
  const dernierPassage = usagerRow.dateDernierPassage ?? now;

  let dateDebut = usagerRow.dateDebutDom;

  const dateFin = usagerRow.dateFinDom;

  if (usagerRow.statutDom === "REFUS") {
    motif = usagerRow.motifRefus ?? "AUTRE";
    dateDebut = usagerRow.dateFinDom;
    dateDecision = usagerRow.dateFinDom;
  }

  if (usagerRow.statutDom === "RADIE") {
    dateDecision = usagerRow.dateFinDom ?? now;
    motif = usagerRow.motifRadiation ?? "AUTRE";
  }

  if (usagerRow.typeDom === "PREMIERE") {
    usagerRow.typeDom = "PREMIERE_DOM";
  }

  const decision: UsagerDecision = {
    uuid: uuidGenerator.random(),
    dateDebut,
    dateDecision,
    dateFin,
    motif,
    motifDetails: "",
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
    phone,
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

function buildEntretien(usagerRow): UsagerEntretien {
  const entretien: UsagerEntretien = {};

  entretien.commentaires = usagerRow.commentaires;
  entretien.domiciliation = usagerRow.domiciliationExistante;
  entretien.typeMenage = usagerRow.compositionMenage;

  entretien.accompagnement = usagerRow.accompagnement;
  if (usagerRow.accompagnement) {
    entretien.accompagnementDetail = usagerRow.accompagnementDetail;
  }

  entretien.revenus = usagerRow.revenus;
  if (usagerRow.revenus) {
    entretien.revenusDetail = usagerRow.revenusDetail;
  }

  entretien.revenus = usagerRow.revenus;
  if (usagerRow.revenus) {
    entretien.revenusDetail = usagerRow.revenusDetail;
  }

  entretien.liencommune = usagerRow.liencommune;
  if (usagerRow.liencommune) {
    entretien.liencommuneDetail = usagerRow.liencommuneDetail;
  }

  entretien.residence = usagerRow.situationResidentielle;
  if (usagerRow.situationResidentielle) {
    entretien.residenceDetail = usagerRow.situationDetails;
  }

  entretien.orientation = usagerRow.orientation;
  if (usagerRow.orientation) {
    entretien.orientationDetail = usagerRow.orientationDetail;
  }

  entretien.raison = usagerRow.raisonDemande;
  if (usagerRow.raisonDemande) {
    entretien.raisonDetail = usagerRow.raisonDemandeDetail;
  }

  entretien.cause = usagerRow.causeInstabilite;
  if (usagerRow.causeInstabilite) {
    entretien.causeDetail = usagerRow.causeDetail;
  }
  return entretien;
}
