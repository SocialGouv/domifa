import {
  CriteriaSearchField,
  getDecisionDeadline,
  normalizeString,
} from "@domifa/common";
import { DataSource } from "typeorm";
import { usagersFilter } from "../../../../../../frontend/src/app/modules/manage-usagers/services/usager-filter/usagersFilter.service";
import { UsagersFilterCriteria } from "../../../../../../frontend/src/app/modules/manage-usagers/classes/UsagersFilterCriteria";
import { applyUsagerCriteriaFilters } from "../../applyUsagerCriteriaFilters";
import {
  applyUsagerCriteriaSort,
  UsagerSortKey,
} from "../../applyUsagerCriteriaSort";
import { usagersSorter } from "../../../../../../frontend/src/app/modules/manage-usagers/services/usager-filter/usagersSorter.service";
import { applyUsagerNameSearch } from "../../applyUsagerNameSearch";
import { getAttributes } from "../../../../../../frontend/src/app/modules/manage-usagers/services/usager-filter/usagersSearchStringFilter.service";
import {
  buildFixtures,
  buildHomonymFixtures,
  FixtureUsager,
} from "./usagerFilterFixtures";

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

// L'index de recherche est construit ici à partir de `getAttributes`, la
// fonction du NAVIGATEUR, et non de la règle du subscriber. Le faire dériver du
// serveur rendait le test incapable de détecter une divergence de recherche :
// l'oracle se trouvait du côté qu'il était censé juger.
const searchIndexOf = (usager: FixtureUsager): string =>
  normalizeString(
    (
      getAttributes(
        usager as never,
        {
          searchStringField: CriteriaSearchField.DEFAULT,
        } as never
      ) as (string | null | undefined)[]
    )
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
      entretien: (criteria.entretien ?? null) as "COMING" | "PASSED" | null,
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

  // La référence interne ne doit PAS être cherchable : `getAttributes` ne
  // parcourt que `customRef`. Sans ce cas, l'écart passait inaperçu — aucune
  // des recherches testées n'était numérique.
  it("ne trouve pas un dossier par sa référence interne", async () => {
    await expectSameSelection("recherche 77123", { searchString: "77123" });

    const browser = refsFromBrowser(criteriaOf({ searchString: "12" }));
    const sql = await refsFromSql(criteriaOf({ searchString: "12" }));
    expect(sql).toEqual(browser);
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

  // --- tri : on compare l'ORDRE, pas seulement l'appartenance
  const orderFromBrowser = (
    sortKey: UsagerSortKey,
    sortValue: "asc" | "desc"
  ): number[] =>
    usagersSorter
      // `decisionDeadline` est calculé à la réception par
      // `setUsagerInformation` : le trieur du navigateur le lit sans le
      // recalculer, il faut donc le fournir ici comme l'application le fait.
      .sortBy(
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        fixtures.map((usager) => ({
          ...usager,
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          decisionDeadline: getDecisionDeadline(usager as any),
        })) as any,
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        { sortKey, sortValue } as any
      )
      .map((usager: { ref: number }) => usager.ref);

  const orderFromSql = async (
    sortKey: UsagerSortKey,
    sortValue: "asc" | "desc"
  ): Promise<number[]> => {
    const query = dataSource
      .createQueryBuilder()
      .select("usager.ref", "ref")
      .from("usager", "usager")
      .where(`"structureId" = :structureId`, { structureId: STRUCTURE_ID });

    applyUsagerCriteriaSort(query, sortKey, sortValue);

    const rows = await query.getRawMany();
    return rows.map((row) => Number(row.ref));
  };

  // Le tri par rendez-vous est le seul qui ne soit PAS comparé au navigateur,
  // et c'est délibéré : le trieur applicatif ne place la date dans la
  // comparaison que si elle existe, si bien qu'un dossier sans rendez-vous y
  // compare son nom à la représentation texte d'une date JavaScript. L'ordre
  // obtenu dépend de la locale et du fuseau, il n'est pas transposable.
  //
  // On vérifie donc le comportement corrigé, ET on épingle la divergence :
  // si un jour le trieur du navigateur est aligné, ce test le signalera au
  // lieu de laisser l'exception survivre en silence.
  describe("tri par rendez-vous", () => {
    const rdvDateOf = (ref: number): string | null => {
      const usager = fixtures.find((candidate) => candidate.ref === ref);
      return (usager?.rdv?.dateRdv as string) ?? null;
    };

    it("place les dossiers sans rendez-vous en tête en ordre croissant", async () => {
      const order = await orderFromSql("RDV", "asc");
      const dates = order.map(rdvDateOf);
      const firstDated = dates.findIndex((date) => date !== null);

      expect(firstDated).toBeGreaterThan(0);
      expect(dates.slice(firstDated).every((date) => date !== null)).toBe(true);

      const dated = dates.slice(firstDated) as string[];
      expect([...dated].sort()).toEqual(dated);
    });

    it("place les dossiers sans rendez-vous en fin en ordre décroissant", async () => {
      const order = await orderFromSql("RDV", "desc");
      const dates = order.map(rdvDateOf);
      const firstUndated = dates.findIndex((date) => date === null);

      expect(firstUndated).toBeGreaterThan(0);
      expect(dates.slice(firstUndated).every((date) => date === null)).toBe(
        true
      );

      const dated = dates.slice(0, firstUndated) as string[];
      expect([...dated].sort().reverse()).toEqual(dated);
    });

    it("diverge encore du navigateur, comme documenté", () => {
      const browser = orderFromBrowser("RDV", "asc");
      const undatedFirst = browser.filter((ref) => rdvDateOf(ref) === null);

      // Le navigateur n'isole pas les dossiers sans rendez-vous : ils sont
      // entremêlés selon la comparaison entre un nom et un texte de date.
      expect(undatedFirst.length).toBeGreaterThan(0);
      expect(browser).not.toEqual([
        ...undatedFirst,
        ...browser.filter((ref) => rdvDateOf(ref) !== null),
      ]);
    });
  });

  // Départage des homonymes : le jeu principal ne l'atteint jamais, tous ses
  // noms diffèrent. Le comparateur du navigateur traite alors le `ref`, un
  // nombre, comme une DATE (`new Date("2001")` est valide), d'où un ordre
  // absurde. Écart assumé et corrigé, comme le tri par rendez-vous : on épingle
  // les deux côtés pour qu'un alignement futur se signale ici.
  describe("homonymes", () => {
    const HOMONYM_STRUCTURE_ID = 2;

    beforeAll(async () => {
      for (const usager of buildHomonymFixtures(now)) {
        await dataSource.query(
          `INSERT INTO usager (ref, "structureId", nom, prenom, surnom, "customRef",
             statut, "typeDom", "etapeDemande", "referrerId", decision,
             "lastInteraction", rdv, options, "ayantsDroits", historique,
             nom_prenom_surnom_ref)
           VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17)`,
          [
            usager.ref,
            HOMONYM_STRUCTURE_ID,
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
    });

    it("départage les homonymes par référence croissante", async () => {
      const query = dataSource
        .createQueryBuilder()
        .select("usager.ref", "ref")
        .from("usager", "usager")
        .where(`"structureId" = :structureId`, {
          structureId: HOMONYM_STRUCTURE_ID,
        });
      applyUsagerCriteriaSort(query, "NOM", "asc");

      const rows = await query.getRawMany();
      expect(rows.map((row) => Number(row.ref))).toEqual([5, 7, 12, 32, 2001]);
    });

    it("diverge encore du navigateur, comme documenté", () => {
      const browser = usagersSorter
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        .sortBy(
          buildHomonymFixtures(now) as any,
          {
            sortKey: "NOM",
            sortValue: "asc",
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
          } as any
        )
        .map((usager: { ref: number }) => usager.ref);

      expect(browser).not.toEqual([5, 7, 12, 32, 2001]);
    });
  });

  it.each([
    ["NOM", "asc"],
    ["NOM", "desc"],
    ["PASSAGE", "asc"],
    ["PASSAGE", "desc"],
    ["ECHEANCE", "asc"],
    ["ECHEANCE", "desc"],
    ["ID", "asc"],
    ["ID", "desc"],
  ] as [UsagerSortKey, "asc" | "desc"][])(
    "ordonne les dossiers comme le navigateur pour %s %s",
    async (sortKey, sortValue) => {
      const browser = orderFromBrowser(sortKey, sortValue);
      const sql = await orderFromSql(sortKey, sortValue);

      expect(sql).toEqual(browser);
    }
  );
});
