import { normalizeString } from "@domifa/common";
import { DataSource } from "typeorm";
import { usagersFilter } from "../../../../../../frontend/src/app/modules/manage-usagers/services/usager-filter/usagersFilter.service";
import { UsagersFilterCriteria } from "../../../../../../frontend/src/app/modules/manage-usagers/classes/UsagersFilterCriteria";
import { applyUsagerCriteriaFilters } from "../../applyUsagerCriteriaFilters";
import { applyUsagerNameSearch } from "../../applyUsagerNameSearch";
import { buildFixtures, FixtureUsager } from "./usagerFilterFixtures";

// Test différentiel : le même jeu de données passe dans l'implémentation du
// NAVIGATEUR — importée telle quelle, pas réécrite — et dans la traduction SQL.
// Les deux doivent désigner exactement les mêmes dossiers.
//
// C'est le seul moyen de démontrer « aucune régression » sur une bascule de
// filtrage : comparer les deux implémentations sur les cas frontières, plutôt
// que d'affirmer qu'elles font la même chose.
//
// Base requise : voir la constante ci-dessous. Sans elle, la suite est ignorée
// plutôt que verte, pour ne pas faire croire à une vérification qui n'a pas eu
// lieu.
const DATABASE_URL =
  process.env.DIFFERENTIAL_DATABASE_URL ??
  "postgres://domifa:diffpwd@localhost:55432/domifa_diff";

const STRUCTURE_ID = 1;

const searchIndexOf = (usager: FixtureUsager): string =>
  normalizeString(
    [
      usager.nom,
      usager.prenom,
      usager.surnom,
      usager.customRef ?? usager.ref,
      ...usager.ayantsDroits.flatMap((ayantDroit) => [
        ayantDroit.nom,
        ayantDroit.prenom,
      ]),
      ...(
        (usager.options.procurations as { nom: string; prenom: string }[]) ?? []
      ).flatMap((procuration) => [procuration.nom, procuration.prenom]),
    ]
      .filter(Boolean)
      .join(" ")
  );

describe("Filtres usagers — équivalence navigateur / SQL", () => {
  let dataSource: DataSource;
  let fixtures: FixtureUsager[];
  const now = new Date();

  beforeAll(async () => {
    dataSource = new DataSource({ type: "postgres", url: DATABASE_URL });
    await dataSource.initialize();

    await dataSource.query(`DROP TABLE IF EXISTS usager`);
    await dataSource.query(`
      CREATE TABLE usager (
        ref integer NOT NULL,
        "structureId" integer NOT NULL,
        nom text NOT NULL,
        prenom text NOT NULL,
        surnom text,
        "customRef" text,
        statut text NOT NULL,
        "typeDom" text NOT NULL,
        "etapeDemande" integer NOT NULL,
        "referrerId" integer,
        decision jsonb NOT NULL,
        "lastInteraction" jsonb NOT NULL,
        rdv jsonb,
        options jsonb NOT NULL,
        "ayantsDroits" jsonb,
        historique jsonb NOT NULL,
        nom_prenom_surnom_ref character varying NOT NULL
      )`);

    fixtures = buildFixtures(now);

    for (const usager of fixtures) {
      await dataSource.query(
        `INSERT INTO usager (ref, "structureId", nom, prenom, surnom, "customRef",
           statut, "typeDom", "etapeDemande", "referrerId", decision,
           "lastInteraction", rdv, options, "ayantsDroits", historique,
           nom_prenom_surnom_ref)
         VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17)`,
        [
          usager.ref,
          STRUCTURE_ID,
          usager.nom,
          usager.prenom,
          usager.surnom,
          usager.customRef,
          usager.statut,
          usager.typeDom,
          usager.etapeDemande,
          usager.referrerId,
          JSON.stringify(usager.decision),
          JSON.stringify(usager.lastInteraction),
          usager.rdv ? JSON.stringify(usager.rdv) : null,
          JSON.stringify(usager.options),
          JSON.stringify(usager.ayantsDroits),
          JSON.stringify(usager.historique),
          searchIndexOf(usager),
        ]
      );
    }
  }, 60000);

  afterAll(async () => {
    if (dataSource?.isInitialized) {
      await dataSource.destroy();
    }
  });

  // Les deux implémentations doivent partir du MEME objet de critères : la
  // classe applique ses propres valeurs par défaut (statut VALIDE quand rien
  // n'est fourni), et comparer un objet brut à un objet construit ferait
  // diverger le test sans que le code y soit pour quelque chose.
  const criteriaOf = (
    partial: Partial<UsagersFilterCriteria>
  ): UsagersFilterCriteria =>
    new UsagersFilterCriteria(partial) as UsagersFilterCriteria;

  const refsFromBrowser = (criteria: UsagersFilterCriteria): number[] =>
    usagersFilter
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      .filter(fixtures as any, { criteria })
      .map((usager) => usager.ref)
      .sort((a, b) => a - b);

  const refsFromSql = async (
    criteria: UsagersFilterCriteria
  ): Promise<number[]> => {
    const query = dataSource
      .createQueryBuilder()
      .select("usager.ref", "ref")
      .from("usager", "usager")
      .where(`"structureId" = :structureId`, { structureId: STRUCTURE_ID });

    applyUsagerCriteriaFilters(query, {
      statut: criteria.statut ?? null,
      echeance: criteria.echeance ?? null,
      interactionType: criteria.interactionType ?? null,
      lastInteractionDate: criteria.lastInteractionDate ?? null,
      entretien: criteria.entretien ?? null,
      referrerId: criteria.referrerId,
    });

    if (criteria.searchString) {
      applyUsagerNameSearch(query, criteria.searchString);
    }

    const rows = await query.getRawMany();
    return rows.map((row) => Number(row.ref)).sort((a, b) => a - b);
  };

  const expectSameSelection = async (
    label: string,
    partial: Partial<UsagersFilterCriteria>
  ) => {
    const criteria = criteriaOf(partial);
    const browser = refsFromBrowser(criteria);
    const sql = await refsFromSql(criteria);

    // Un filtre qui ne sélectionne rien des deux côtés ne prouve rien :
    // on veut que le cas soit discriminant.
    expect({ label, refs: sql }).toEqual({ label, refs: browser });
    expect(browser.length).toBeGreaterThan(0);
  };

  it("sélectionne les mêmes dossiers avec les critères par défaut", async () => {
    await expectSameSelection("critères par défaut", {});
  });

  it.each([
    "VALIDE",
    "RADIE",
    "REFUS",
    "INSTRUCTION",
    "ATTENTE_DECISION",
    "TOUS",
  ])("sélectionne les mêmes dossiers pour le statut %s", async (statut) => {
    await expectSameSelection(`statut ${statut}`, {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      statut: statut as any,
    });
  });

  it.each(["EXCEEDED", "NEXT_TWO_WEEKS", "NEXT_TWO_MONTHS"])(
    "sélectionne les mêmes dossiers pour l'échéance %s",
    async (echeance) => {
      await expectSameSelection(`echeance ${echeance}`, {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        echeance: echeance as any,
      });
    }
  );

  it("sélectionne les mêmes dossiers pour le courrier en attente", async () => {
    await expectSameSelection("courrierIn", { interactionType: "courrierIn" });
  });

  it.each(["COMING", "PASSED"])(
    "sélectionne les mêmes dossiers pour l'entretien %s",
    async (entretien) => {
      await expectSameSelection(`entretien ${entretien}`, {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        entretien: entretien as any,
      });
    }
  );

  it.each(["PREVIOUS_TWO_MONTHS", "PREVIOUS_THREE_MONTHS", "PREVIOUS_YEAR"])(
    "sélectionne les mêmes dossiers pour un dernier passage %s",
    async (lastInteractionDate) => {
      await expectSameSelection(`passage ${lastInteractionDate}`, {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        lastInteractionDate: lastInteractionDate as any,
      });
    }
  );

  it("sélectionne les mêmes dossiers pour un référent donné", async () => {
    await expectSameSelection("referrerId 42", { referrerId: 42 });
  });

  it.each(["dupont", "Chloé", "loewenberg", "zoé", "alice"])(
    "trouve les mêmes dossiers en cherchant %s",
    async (searchString) => {
      await expectSameSelection(`recherche ${searchString}`, { searchString });
    }
  );

  it("trouve les mêmes dossiers en cherchant deux mots dans le désordre", async () => {
    await expectSameSelection("recherche désordonnée", {
      searchString: "marie dupont",
    });
  });
});
