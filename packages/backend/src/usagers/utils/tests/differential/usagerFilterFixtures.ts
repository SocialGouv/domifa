import { addDays, subDays, subMonths } from "date-fns";

// Jeu de données du test différentiel. Chaque usager est construit pour tomber
// sur une frontière d'au moins un filtre : la veille et le jour même d'une
// échéance, un champ absent, un rendez-vous à aujourd'hui, un référent nul.
// C'est là que deux implémentations d'une même règle divergent, jamais au
// milieu d'un intervalle.
export type FixtureUsager = {
  ref: number;
  nom: string;
  prenom: string;
  surnom: string | null;
  customRef: string | null;
  statut: string;
  typeDom: string;
  etapeDemande: number;
  referrerId: number | null;
  decision: Record<string, unknown>;
  lastInteraction: Record<string, unknown>;
  rdv: Record<string, unknown> | null;
  options: Record<string, unknown>;
  ayantsDroits: Record<string, unknown>[];
  historique: Record<string, unknown>[];
};

const iso = (date: Date): string => date.toISOString();
const day = (date: Date): string => date.toISOString().split("T")[0];

export const buildFixtures = (now: Date): FixtureUsager[] => {
  const base = {
    surnom: null as string | null,
    customRef: null as string | null,
    typeDom: "PREMIERE_DOM",
    etapeDemande: 0,
    referrerId: null as number | null,
    rdv: null as Record<string, unknown> | null,
    options: { transfert: { actif: false }, procurations: [] },
    ayantsDroits: [] as Record<string, unknown>[],
    historique: [] as Record<string, unknown>[],
    lastInteraction: {
      dateInteraction: iso(subDays(now, 1)),
      enAttente: false,
    },
    decision: { statut: "VALIDE", dateFin: iso(addDays(now, 200)) },
    statut: "VALIDE",
  };

  const usagers: FixtureUsager[] = [];
  let ref = 1;
  const add = (
    partial: Partial<FixtureUsager>,
    nom: string,
    prenom: string
  ) => {
    usagers.push({ ...base, ...partial, ref: ref++, nom, prenom });
  };

  // --- statuts
  for (const statut of [
    "VALIDE",
    "RADIE",
    "REFUS",
    "INSTRUCTION",
    "ATTENTE_DECISION",
  ]) {
    add({ statut }, `Statut${statut}`, "Test");
  }

  // --- echeance : frontières exactes des seuils 0, 16 et 61 jours
  for (const offset of [-1, 0, 1, 15, 16, 17, 60, 61, 62]) {
    add(
      {
        statut: "VALIDE",
        decision: { statut: "VALIDE", dateFin: iso(addDays(now, offset)) },
      },
      `Echeance${offset < 0 ? "Moins" : "Plus"}${Math.abs(offset)}`,
      "Test"
    );
  }
  // dateFin absente : le checker refuse quel que soit le seuil
  add(
    { statut: "VALIDE", decision: { statut: "VALIDE" } },
    "EcheanceSansDateFin",
    "Test"
  );

  // --- dernier passage : de part et d'autre des échéances glissantes
  for (const months of [1, 3, 6, 13]) {
    add(
      {
        statut: "VALIDE",
        lastInteraction: {
          dateInteraction: iso(subMonths(now, months)),
          enAttente: false,
        },
      },
      `Passage${months}Mois`,
      "Test"
    );
  }

  // --- courrier en attente
  add(
    {
      statut: "VALIDE",
      lastInteraction: {
        dateInteraction: iso(subDays(now, 2)),
        enAttente: true,
      },
    },
    "CourrierEnAttente",
    "Test"
  );

  // --- entretien : rendez-vous hier, aujourd'hui, demain, et étape au-delà
  for (const [offset, label] of [
    [-1, "Hier"],
    [0, "Aujourdhui"],
    [1, "Demain"],
  ] as [number, string][]) {
    add(
      {
        statut: "VALIDE",
        etapeDemande: 1,
        rdv: { dateRdv: day(addDays(now, offset)), userId: 1 },
      },
      `Rdv${label}`,
      "Test"
    );
  }
  add(
    {
      statut: "VALIDE",
      etapeDemande: 9,
      rdv: { dateRdv: day(addDays(now, 1)), userId: 1 },
    },
    "RdvEtapeDepassee",
    "Test"
  );

  // --- référents
  add({ statut: "VALIDE", referrerId: 42 }, "ReferentQuaranteDeux", "Test");
  add({ statut: "VALIDE", referrerId: null }, "ReferentAbsent", "Test");

  // --- recherche par nom : accents, ligatures, ayants droit, mandataires
  add({ statut: "VALIDE" }, "Lœwenberg-Ünal", "Chloé");
  add(
    {
      statut: "VALIDE",
      ayantsDroits: [{ nom: "Martin", prenom: "Zoé", dateNaissance: null }],
    },
    "Dupont",
    "Marie"
  );
  add(
    {
      statut: "VALIDE",
      options: {
        transfert: { actif: false },
        procurations: [{ nom: "Bernard", prenom: "Alice" }],
      },
    },
    "Durand",
    "Paul"
  );

  return usagers;
};
