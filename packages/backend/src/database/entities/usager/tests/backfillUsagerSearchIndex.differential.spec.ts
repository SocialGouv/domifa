import { DataSource, InsertEvent, QueryRunner } from "typeorm";
import { BackfillUsagerSearchIndex1786500000000 } from "../../../../_migrations/1786500000000-backfill-usager-search-index";
import { UsagerSubscriber } from "../UsagerSubscriber.typeorm";
import { UsagerTable } from "../UsagerTable.typeorm";

// Test différentiel de la migration de rattrapage : les valeurs qu'elle écrit
// doivent être exactement celles que le subscriber — la règle de référence,
// appelée telle quelle et non recopiée — aurait produites.
//
// La suite tourne dans un schéma dédié (`search_path`) pour ne pas entrer en
// collision avec la table `usager` que la suite des filtres recrée dans le
// même Postgres.
const DATABASE_URL =
  process.env.DIFFERENTIAL_DATABASE_URL ??
  "postgres://domifa:diffpwd@localhost:55432/domifa_diff";

const SCHEMA = "migration_backfill_diff";

// Doit dépasser le BATCH_SIZE de la migration (2000) pour que la pagination
// par keyset soit réellement exercée, pas seulement le premier lot.
const FILLER_ROWS = 2100;

type SeededRow = {
  uuid: string;
  nom: string | null;
  prenom: string | null;
  surnom: string | null;
  customRef: string | null;
  ayantsDroits: { nom?: string; prenom?: string }[] | null;
  options: { procurations?: { nom?: string; prenom?: string }[] };
  nom_prenom_surnom_ref: string | null;
};

// L'oracle est le subscriber lui-même : on lui passe une entité et on lit ce
// qu'il y écrit. Toute divergence migration/subscriber casse la recherche pour
// les dossiers rattrapés, silencieusement.
const subscriber = new UsagerSubscriber();
const expectedIndex = (row: SeededRow): string | null => {
  const entity = {
    nom: row.nom,
    prenom: row.prenom,
    surnom: row.surnom,
    customRef: row.customRef,
    ayantsDroits: row.ayantsDroits,
    options: row.options,
  } as unknown as UsagerTable;
  subscriber.beforeInsert({ entity } as InsertEvent<UsagerTable>);
  return entity.nom_prenom_surnom_ref ?? null;
};

describe("Migration backfillUsagerSearchIndex — équivalence avec le subscriber", () => {
  let dataSource: DataSource;
  let queryRunner: QueryRunner;
  const migration = new BackfillUsagerSearchIndex1786500000000();

  beforeAll(async () => {
    dataSource = new DataSource({
      type: "postgres",
      url: DATABASE_URL,
      extra: { options: `-c search_path=${SCHEMA}` },
    });
    await dataSource.initialize();

    await dataSource.query(`CREATE SCHEMA IF NOT EXISTS ${SCHEMA}`);
    await dataSource.query(`DROP TABLE IF EXISTS ${SCHEMA}.usager`);
    await dataSource.query(`
      CREATE TABLE ${SCHEMA}.usager (
        uuid uuid PRIMARY KEY DEFAULT gen_random_uuid(),
        ref integer NOT NULL,
        nom text,
        prenom text,
        surnom text,
        "customRef" text,
        "ayantsDroits" jsonb,
        options jsonb NOT NULL DEFAULT '{}'::jsonb,
        nom_prenom_surnom_ref text
      )`);

    // Volume : de quoi remplir plus d'un lot.
    await dataSource.query(
      `INSERT INTO usager (ref, nom, prenom)
       SELECT g, 'Nom' || g, 'Prénom' || g FROM generate_series(1, ${FILLER_ROWS}) g`
    );

    // Cas frontières : trim, ligatures/accents, ayants droit et mandataires
    // partiels, ligne déjà à jour, ligne sans nom (hors périmètre).
    await dataSource.query(
      `INSERT INTO usager (ref, nom, prenom, surnom, "customRef", "ayantsDroits", options, nom_prenom_surnom_ref)
       VALUES
         (9001, '  Œuvré  ', ' François ', NULL, NULL, NULL, '{}', NULL),
         (9002, 'Petit', 'Anna', 'Nana', 'DOSSIER-42',
          '[{"nom":"Petit","prenom":"Zoé"},{"prenom":"Lou"}]',
          '{"procurations":[{"nom":"Mandataire","prenom":"Paul"},{"nom":null}]}', NULL),
         (9003, 'Déjà', 'Àjour', NULL, NULL, NULL, '{}', 'deja ajour'),
         (9004, NULL, 'SansNom', NULL, NULL, NULL, '{}', 'valeur-preexistante')`
    );

    queryRunner = dataSource.createQueryRunner();
    await migration.up(queryRunner);
  }, 120_000);

  afterAll(async () => {
    await queryRunner?.release();
    await dataSource?.destroy();
  });

  const fetchRows = (): Promise<SeededRow[]> =>
    dataSource.query(
      `SELECT uuid, nom, prenom, surnom, "customRef", "ayantsDroits", options,
              nom_prenom_surnom_ref
         FROM usager ORDER BY ref`
    );

  it("écrit, sur chaque ligne éligible, exactement ce que le subscriber aurait écrit", async () => {
    const rows = await fetchRows();
    expect(rows).toHaveLength(FILLER_ROWS + 4);

    const eligibleRows = rows.filter((row) => row.nom && row.prenom);
    expect(eligibleRows).toHaveLength(FILLER_ROWS + 3);

    for (const row of eligibleRows) {
      expect(row.nom_prenom_surnom_ref).toBe(expectedIndex(row));
    }
  });

  it("indexe les ayants droit et les mandataires, en ignorant les champs absents", async () => {
    const [row] = await dataSource.query(
      `SELECT nom_prenom_surnom_ref FROM usager WHERE ref = 9002`
    );
    expect(row.nom_prenom_surnom_ref).toBe(
      "petit anna nana dossier 42 petit zoe lou mandataire paul"
    );
  });

  it("ne touche pas aux lignes hors périmètre (nom manquant)", async () => {
    const [row] = await dataSource.query(
      `SELECT nom_prenom_surnom_ref FROM usager WHERE ref = 9004`
    );
    expect(row.nom_prenom_surnom_ref).toBe("valeur-preexistante");
  });

  it("est idempotente : une seconde exécution ne réécrit aucune ligne", async () => {
    const before: { uuid: string; xmin: string }[] = await dataSource.query(
      `SELECT uuid, xmin::text AS xmin FROM usager ORDER BY uuid`
    );

    await migration.up(queryRunner);

    const after: { uuid: string; xmin: string }[] = await dataSource.query(
      `SELECT uuid, xmin::text AS xmin FROM usager ORDER BY uuid`
    );
    // xmin change à chaque réécriture de la ligne : son immobilité prouve que
    // `IS DISTINCT FROM` a bien sauté toutes les lignes déjà à jour.
    expect(after).toEqual(before);
  }, 120_000);
});
