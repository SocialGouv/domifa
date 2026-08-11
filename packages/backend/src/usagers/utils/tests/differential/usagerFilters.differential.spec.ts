import {
  CriteriaSearchField,
  ETAPE_ENTRETIEN,
  getDecisionDeadline,
  normalizeString,
} from "@domifa/common";
import { format, subDays } from "date-fns";
import { utcToZonedTime, zonedTimeToUtc } from "date-fns-tz";
import { DataSource } from "typeorm";
import { usagersFilter } from "../../../../../../frontend/src/app/modules/manage-usagers/services/usager-filter/usagersFilter.service";
import { UsagersFilterCriteria } from "../../../../../../frontend/src/app/modules/manage-usagers/classes/UsagersFilterCriteria";
import { applyUsagerCriteriaFilters } from "../../applyUsagerCriteriaFilters";
import {
  applyUsagerCriteriaSort,
  DECISION_DEADLINE_SQL,
  UsagerSortKey,
} from "../../applyUsagerCriteriaSort";
import {
  assertSupportedTimeZone,
  localTodaySql,
  SUPPORTED_TIME_ZONES,
} from "../../usagerQueryDates";
import { usagersSorter } from "../../../../../../frontend/src/app/modules/manage-usagers/services/usager-filter/usagersSorter.service";
import { applyUsagerNameSearch } from "../../applyUsagerNameSearch";
import { getAttributes } from "../../../../../../frontend/src/app/modules/manage-usagers/services/usager-filter/usagersSearchStringFilter.service";
import {
  buildDeadlineBranchFixtures,
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

// Le « navigateur » de ce test tourne dans le fuseau du process : c'est lui
// qu'on passe au SQL, comme l'endpoint passera `structure.timeZone`. Lancer la
// suite sous un autre fuseau éprouve un autre appariement :
//   TZ=Europe/Paris pnpm test:differential     (défaut)
//   TZ=Pacific/Noumea pnpm test:differential   (structure ultramarine)
// Un fuseau hors de la liste du produit (dont UTC) échoue ici, explicitement.
const BROWSER_TZ = assertSupportedTimeZone(
  Intl.DateTimeFormat().resolvedOptions().timeZone
);

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
    // Fuseau de session DÉLIBÉRÉMENT hostile : l'application ne fixe jamais le
    // GUC `timezone` (node-postgres ne transmet pas `TZ` au serveur), le SQL
    // ne doit donc dépendre que des `AT TIME ZONE` explicites. Avec la session
    // au fuseau du conteneur, une régression vers `CURRENT_DATE` ou `::date`
    // resterait invisible.
    dataSource = new DataSource({
      type: "postgres",
      url: DATABASE_URL,
      extra: { options: "-c TimeZone=UTC" },
    });
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
      await insertUsager(usager, STRUCTURE_ID);
    }
  }, 60000);

  const insertUsager = (
    usager: FixtureUsager,
    structureId: number
  ): Promise<unknown> =>
    dataSource.query(
      `INSERT INTO usager (ref, "structureId", nom, prenom, surnom, "customRef",
         statut, "typeDom", "etapeDemande", "referrerId", decision,
         "lastInteraction", rdv, options, "ayantsDroits", historique,
         nom_prenom_surnom_ref)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17)`,
      [
        usager.ref,
        structureId,
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

    applyUsagerCriteriaFilters(
      query,
      {
        statut: criteria.statut ?? null,
        echeance: criteria.echeance ?? null,
        interactionType: criteria.interactionType ?? null,
        lastInteractionDate: criteria.lastInteractionDate ?? null,
        entretien: (criteria.entretien ?? null) as "COMING" | "PASSED" | null,
        referrerId: criteria.referrerId,
      },
      BROWSER_TZ
    );

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

  // L'entretien est le seul filtre qui ne soit PAS comparé au navigateur en
  // égalité brute : le checker travaille en date UTC, la traduction SQL en
  // date locale de la structure — c'est l'alignement assumé documenté dans
  // `applyUsagerCriteriaFilters`, et « aujourd'hui » diffère entre les deux
  // conventions une partie de la journée (jusqu'à 13 h à Nouméa). L'attendu
  // est donc calculé depuis la sémantique CHOISIE — le jour local — et la
  // divergence avec le navigateur est épinglée par son propre test, plus bas.
  describe("entretien", () => {
    const localDay = (date: Date): string =>
      format(utcToZonedTime(date, BROWSER_TZ), "yyyy-MM-dd");

    const expectedRefs = (entretien: "COMING" | "PASSED"): number[] => {
      const today = localDay(new Date());
      return fixtures
        .filter(
          (usager) =>
            usager.rdv?.dateRdv &&
            usager.etapeDemande <= ETAPE_ENTRETIEN &&
            (entretien === "COMING"
              ? localDay(new Date(usager.rdv.dateRdv as string)) > today
              : localDay(new Date(usager.rdv.dateRdv as string)) < today)
        )
        .map((usager) => usager.ref)
        .sort((a, b) => a - b);
    };

    it.each(["COMING", "PASSED"] as const)(
      "sélectionne les dossiers du jour local de la structure pour %s",
      async (entretien) => {
        const expected = expectedRefs(entretien);
        const sql = await refsFromSql(criteriaOf({ entretien } as never));

        expect({ entretien, refs: sql }).toEqual({ entretien, refs: expected });
        expect(expected.length).toBeGreaterThan(0);
      }
    );
  });

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

    applyUsagerCriteriaSort(query, sortKey, sortValue, BROWSER_TZ);

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
        await insertUsager(usager, HOMONYM_STRUCTURE_ID);
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
      applyUsagerCriteriaSort(query, "NOM", "asc", BROWSER_TZ);

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

  // Références affichées identiques : rien n'interdit les doublons de
  // `customRef` (l'IHM se contente de les signaler). Sans départage unique,
  // l'ordre suit l'emplacement physique des lignes — une réécriture suffit à
  // le changer, et une pagination montrerait un dossier deux fois, un autre
  // jamais.
  describe("tri ID avec références en doublon", () => {
    const DUPLICATE_REF_STRUCTURE_ID = 5;

    beforeAll(async () => {
      const [model] = fixtures;
      for (const ref of [41, 42, 43, 44, 45]) {
        await insertUsager(
          { ...model, ref, customRef: "DUP", nom: "Doublon", prenom: "Test" },
          DUPLICATE_REF_STRUCTURE_ID
        );
      }
      // Réécriture sans changement : Postgres déplace physiquement les lignes,
      // ce qui suffisait à inverser l'ordre rendu avant le départage.
      await dataSource.query(
        `UPDATE usager SET statut = statut
          WHERE "structureId" = $1 AND ref IN (41, 42)`,
        [DUPLICATE_REF_STRUCTURE_ID]
      );
    });

    it("rend un ordre total, insensible à l'emplacement physique des lignes", async () => {
      const query = dataSource
        .createQueryBuilder()
        .select("usager.ref", "ref")
        .from("usager", "usager")
        .where(`"structureId" = :structureId`, {
          structureId: DUPLICATE_REF_STRUCTURE_ID,
        });
      applyUsagerCriteriaSort(query, "ID", "asc", BROWSER_TZ);

      const rows = await query.getRawMany();
      expect(rows.map((row) => Number(row.ref))).toEqual([41, 42, 43, 44, 45]);
    });
  });

  // Valeur de l'échéance affichée, branche par branche : le jeu principal est
  // entièrement en PREMIERE_DOM, ces cas couvrent RADIE, REFUS et les trois
  // gardes du RENOUVELLEMENT. Comparaison de VALEUR, pas d'ordre : un dossier
  // RADIE sans date produit un `Invalid Date` côté navigateur, et trier sur
  // NaN rendrait un ordre indéfini.
  describe("échéance affichée : équivalence de DECISION_DEADLINE_SQL", () => {
    const DEADLINE_STRUCTURE_ID = 4;
    let deadlineFixtures: FixtureUsager[];

    beforeAll(async () => {
      deadlineFixtures = buildDeadlineBranchFixtures(now);
      for (const usager of deadlineFixtures) {
        await insertUsager(usager, DEADLINE_STRUCTURE_ID);
      }
    });

    it("calcule la même échéance que getDecisionDeadline sur chaque branche", async () => {
      const rows: { ref: string; deadline: Date | null }[] =
        await dataSource.query(
          `SELECT ref, ${DECISION_DEADLINE_SQL} AS deadline
             FROM usager WHERE "structureId" = $1 ORDER BY ref`,
          [DEADLINE_STRUCTURE_ID]
        );
      expect(rows).toHaveLength(deadlineFixtures.length);

      for (const usager of deadlineFixtures) {
        const row = rows.find((candidate) => Number(candidate.ref) === usager.ref);
        const browser = getDecisionDeadline(
          usager as never
        ).dateToDisplay as Date | null;
        const sql = row?.deadline ?? null;

        if (browser !== null && Number.isNaN(browser.getTime())) {
          // RADIE avec seulement `dateDecision` : `new Date(undefined)` côté
          // navigateur. Le SQL rend NULL — écart assumé, épinglé ici pour
          // qu'un alignement futur se signale.
          expect({ ref: usager.ref, deadline: sql }).toEqual({
            ref: usager.ref,
            deadline: null,
          });
          continue;
        }

        expect({
          ref: usager.ref,
          deadline: sql === null ? null : sql.toISOString(),
        }).toEqual({
          ref: usager.ref,
          deadline: browser === null ? null : browser.toISOString(),
        });
      }
    });

    it("épingle bien le cas Invalid Date, sinon ce test ne prouve rien", () => {
      const invalid = deadlineFixtures.filter((usager) => {
        const browser = getDecisionDeadline(usager as never)
          .dateToDisplay as Date | null;
        return browser !== null && Number.isNaN(browser.getTime());
      });
      expect(invalid).toHaveLength(1);
    });
  });

  // « Aujourd'hui » côté SQL doit venir du fuseau de la STRUCTURE, jamais du
  // fuseau de session : `CURRENT_DATE` serait vert la plus grande partie de
  // la journée (les jours de session et de structure coïncident presque
  // toujours), et un test relatif à l'heure d'exécution ne tuerait cette
  // régression que par chance. Les instants FIXES ci-dessous sont
  // discriminants par construction : pour chacun, au moins un fuseau donne
  // un jour différent du jour UTC de session, et aucun ne vaut la date du
  // jour réel.
  describe("localTodaySql : le jour de référence est celui du fuseau demandé", () => {
    const FIXED_INSTANTS = [
      "2026-01-15T23:30:00Z",
      "2026-06-15T01:30:00Z",
      "2026-06-15T12:00:00Z",
    ];

    it.each(FIXED_INSTANTS)(
      "rend le jour local de chaque fuseau pour l'instant %s",
      async (instant) => {
        for (const timeZone of Object.keys(SUPPORTED_TIME_ZONES)) {
          const [row] = await dataSource.query(
            `SELECT ${localTodaySql(
              assertSupportedTimeZone(timeZone),
              `TIMESTAMPTZ '${instant}'`
            )}::text AS today`
          );
          const expected = format(
            utcToZonedTime(new Date(instant), timeZone),
            "yyyy-MM-dd"
          );
          expect({ timeZone, instant, today: row.today }).toEqual({
            timeZone,
            instant,
            today: expected,
          });
        }
      }
    );
  });

  // Une valeur `PREVIOUS_*` inconnue fait crasher le checker navigateur et
  // est refusée par le DTO en amont ; côté SQL elle rend l'ensemble vide,
  // pas une 500.
  it("rend un ensemble vide sur une échéance PREVIOUS_* inconnue", async () => {
    const sql = await refsFromSql(
      criteriaOf({ echeance: "PREVIOUS_UNKNOWN" as never })
    );
    expect(sql).toEqual([]);
  });

  // Autour de minuit, le checker entretien du navigateur (date UTC) et le SQL
  // (date locale de la structure) ne classent pas pareil : c'est l'alignement
  // assumé documenté dans `applyUsagerCriteriaFilters`. Épinglé comme le tri
  // par rendez-vous : si un jour le navigateur passe en date locale, ce test
  // le signalera. Les deux sondes couvrent les deux fenêtres possibles de
  // l'heure d'exécution ; au moins une diverge toujours, quel que soit le
  // fuseau supporté.
  describe("entretien autour de minuit", () => {
    const MIDNIGHT_STRUCTURE_ID = 3;
    let probes: FixtureUsager[];

    beforeAll(async () => {
      const [model] = fixtures;
      const zonedNow = utcToZonedTime(now, BROWSER_TZ);

      const lateUtcToday = new Date(now);
      lateUtcToday.setUTCHours(23, 30, 0, 0);

      const lateLocalYesterday = zonedTimeToUtc(
        `${format(subDays(zonedNow, 1), "yyyy-MM-dd")}T23:30:00`,
        BROWSER_TZ
      );

      probes = [lateUtcToday, lateLocalYesterday].map((dateRdv, index) => ({
        ...model,
        ref: 61 + index,
        nom: `Minuit${61 + index}`,
        prenom: "Test",
        etapeDemande: 1,
        rdv: { dateRdv: dateRdv.toISOString(), userId: 1 },
      }));

      for (const usager of probes) {
        await insertUsager(usager, MIDNIGHT_STRUCTURE_ID);
      }
    });

    const classifyBrowser = (usager: FixtureUsager): string =>
      (["COMING", "PASSED"] as const)
        .filter(
          (entretien) =>
            usagersFilter.filter([usager] as never, {
              criteria: criteriaOf({ entretien } as never),
            }).length > 0
        )
        .join(",");

    const classifySql = async (usager: FixtureUsager): Promise<string> => {
      const labels: string[] = [];
      for (const entretien of ["COMING", "PASSED"] as const) {
        const query = dataSource
          .createQueryBuilder()
          .select("usager.ref", "ref")
          .from("usager", "usager")
          .where(`"structureId" = :structureId AND ref = :ref`, {
            structureId: MIDNIGHT_STRUCTURE_ID,
            ref: usager.ref,
          });
        applyUsagerCriteriaFilters(query, { entretien }, BROWSER_TZ);
        if ((await query.getRawMany()).length > 0) {
          labels.push(entretien);
        }
      }
      return labels.join(",");
    };

    it("diverge encore du navigateur autour de minuit, comme documenté", async () => {
      const verdicts = [];
      for (const usager of probes) {
        verdicts.push({
          browser: classifyBrowser(usager),
          sql: await classifySql(usager),
        });
      }
      expect(
        verdicts.some((verdict) => verdict.browser !== verdict.sql)
      ).toBe(true);
    });
  });
});
