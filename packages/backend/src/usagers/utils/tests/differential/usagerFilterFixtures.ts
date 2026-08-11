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

// Instant frontière : 22h30 UTC est un jour local DIFFÉRENT du jour UTC dans
// les fuseaux à décalage positif (Paris, Nouméa…). Des dates construites à la
// même heure murale que `now` sont invariantes par fuseau — le jeu ne peut
// alors PAS détecter une confusion de fuseau. Celles-ci le peuvent.
const isoLateUtc = (date: Date): string => {
  const boundary = new Date(date);
  boundary.setUTCHours(22, 30, 0, 0);
  return boundary.toISOString();
};

// Milieu de journée dans TOUS les fuseaux supportés (UTC-10 à UTC+12) : le
// jour local et le jour UTC coïncident, la classification est la même pour le
// checker navigateur (date UTC) et pour le SQL (date locale).
const isoMidday = (date: Date): string => {
  const midday = new Date(date);
  midday.setUTCHours(11, 30, 0, 0);
  return midday.toISOString();
};

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

  // --- echeance : frontières exactes des seuils 0, 16 et 61 jours, posées à
  // 22h30 UTC pour que le jour local diffère du jour UTC. L'offset -2 garantit
  // qu'« Échéance dépassée » reste discriminant même quand le fuseau local
  // décale tous les instants d'un jour.
  for (const offset of [-2, -1, 0, 1, 15, 16, 17, 60, 61, 62]) {
    add(
      {
        statut: "VALIDE",
        decision: {
          statut: "VALIDE",
          dateFin: isoLateUtc(addDays(now, offset)),
        },
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

  // --- entretien : rendez-vous hier, aujourd'hui, demain, et étape au-delà.
  // En production `dateRdv` est un horodatage complet (`RdvDto` fait
  // `new Date(value)`), jamais une date seule : la forme date-seule serait en
  // plus interprétée dans le fuseau de session par `::timestamptz`. Milieu de
  // journée : le checker navigateur (date UTC) et le SQL (date locale) ne
  // divergent qu'autour de minuit, et cet écart-là est un alignement assumé,
  // épinglé par son propre test.
  // Les offsets ±2 gardent COMING et PASSED discriminants dans tous les
  // fuseaux : selon l'heure d'exécution, le jour local d'un instant à 11h30
  // UTC peut décaler d'un jour par rapport à son jour UTC.
  for (const [offset, label] of [
    [-2, "AvantHier"],
    [-1, "Hier"],
    [0, "Aujourdhui"],
    [1, "Demain"],
    [2, "ApresDemain"],
  ] as [number, string][]) {
    add(
      {
        statut: "VALIDE",
        etapeDemande: 1,
        rdv: { dateRdv: isoMidday(addDays(now, offset)), userId: 1 },
      },
      `Rdv${label}`,
      "Test"
    );
  }
  add(
    {
      statut: "VALIDE",
      etapeDemande: 9,
      rdv: { dateRdv: isoMidday(addDays(now, 1)), userId: 1 },
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

  // --- collation : particules, apostrophes, accents, casse mixte. Ce sont les
  // seuls cas où `localeCompare` et une collation système divergent, et le jeu
  // n'en contenait aucun.
  for (const [nom, prenom] of [
    ["Le Gall", "Anne"],
    ["Leblanc", "Bruno"],
    ["LEBRUN", "Carla"],
    ["O'Brien", "Dylan"],
    ["Oberkampf", "Elsa"],
    ["Ötzi", "Franz"],
    ["Émile", "Gaby"],
    ["Emilie", "Hugo"],
    ["Saint-Pierre", "Iris"],
  ] as [string, string][]) {
    add({ statut: "VALIDE" }, nom, prenom);
  }

  // --- références personnalisées : recherche numérique et tri alphabétique
  add({ statut: "VALIDE", customRef: "77123" }, "RefNumerique", "Test");
  add({ statut: "VALIDE", customRef: "A-77" }, "RefAlphabetique", "Test");

  return usagers;
};

// Branches de `getDecisionDeadline` que le jeu principal n'atteint jamais :
// il est entièrement en PREMIERE_DOM avec un historique vide. Isolées parce
// qu'un dossier RADIE sans date produit un `Invalid Date` côté navigateur, et
// que trier sur NaN rendrait l'ordre du jeu principal indéfini. Elles servent
// au test de VALEUR de `DECISION_DEADLINE_SQL`, ligne à ligne.
export const buildDeadlineBranchFixtures = (now: Date): FixtureUsager[] => {
  const [model] = buildFixtures(now);
  const at = (offset: number): string => iso(addDays(now, offset));

  const cases: Array<Partial<FixtureUsager>> = [
    // VALIDE nominal
    { decision: { statut: "VALIDE", dateFin: at(30) } },
    // VALIDE sans dateFin mais datée : passe la garde, aucune branche ne prend
    {
      decision: { statut: "VALIDE", dateDecision: at(-10) },
      typeDom: "PREMIERE_DOM",
    },
    // RADIE : dateDebut prioritaire, puis repli sur dateFin
    { decision: { statut: "RADIE", dateDebut: at(-40), dateFin: at(-20) } },
    { decision: { statut: "RADIE", dateFin: at(-20) } },
    // RADIE avec seulement dateDecision : le navigateur produit un
    // `Invalid Date` (new Date(undefined)), le SQL NULL — écart assumé,
    // épinglé dans le spec.
    { decision: { statut: "RADIE", dateDecision: at(-5) } },
    { decision: { statut: "REFUS", dateDebut: at(-15) } },
    // RENOUVELLEMENT : dernière entrée de l'historique
    {
      typeDom: "RENOUVELLEMENT",
      statut: "INSTRUCTION",
      decision: { statut: "INSTRUCTION", dateDecision: at(-3) },
      historique: [{ dateFin: at(-100) }, { dateFin: at(-50) }],
    },
    // RENOUVELLEMENT en attente : avant-dernière entrée
    {
      typeDom: "RENOUVELLEMENT",
      statut: "ATTENTE_DECISION",
      decision: { statut: "ATTENTE_DECISION", dateDecision: at(-3) },
      historique: [{ dateFin: at(-100) }, { dateFin: at(-50) }],
    },
    // RENOUVELLEMENT en attente, historique trop court : la garde de longueur
    {
      typeDom: "RENOUVELLEMENT",
      statut: "ATTENTE_DECISION",
      decision: { statut: "ATTENTE_DECISION", dateDecision: at(-3) },
      historique: [{ dateFin: at(-100) }],
    },
    // RENOUVELLEMENT dont l'entrée d'historique n'a pas de dateFin : repli
    // sur dateDecision
    {
      typeDom: "RENOUVELLEMENT",
      statut: "INSTRUCTION",
      decision: { statut: "INSTRUCTION", dateDecision: at(-3) },
      historique: [{ dateDebut: at(-100) }],
    },
    // Décision sans aucune date : la garde d'entrée de la fonction
    {
      typeDom: "RENOUVELLEMENT",
      statut: "INSTRUCTION",
      decision: { statut: "INSTRUCTION" },
      historique: [{ dateFin: at(-100) }],
    },
  ];

  return cases.map((partial, index) => ({
    ...model,
    ...partial,
    ref: 3001 + index,
    nom: `Deadline${3001 + index}`,
    prenom: "Test",
    customRef: null,
  }));
};

// Homonymes : ils partagent nom ET prénom, donc ils atteignent le départage du
// tri, que le jeu principal ne touche jamais puisque tous ses noms diffèrent.
// Isolés dans leur propre structure pour ne pas perturber les comparaisons
// globales.
export const buildHomonymFixtures = (now: Date): FixtureUsager[] => {
  const [model] = buildFixtures(now);
  return [2001, 5, 7, 12, 32].map((ref) => ({
    ...model,
    ref,
    nom: "Martin",
    prenom: "Jean",
    customRef: null,
  }));
};
