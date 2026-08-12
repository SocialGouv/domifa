import { createHash } from "crypto";
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
        nom_prenom_surnom_ref text NOT NULL
      )`);
    // L'index btree de production : la migration doit le SUPPRIMER — un tuple
    // btree plafonne à 2704 octets, et l'index enrichi n'a pas de borne.
    await dataSource.query(
      `CREATE INDEX "IDX_f072e2874bd87ecb6da2fbd66e"
          ON ${SCHEMA}.usager USING btree (nom_prenom_surnom_ref)`
    );

    // Volume : de quoi remplir plus d'un lot.
    await dataSource.query(
      `INSERT INTO usager (ref, nom, prenom, nom_prenom_surnom_ref)
       SELECT g, 'Nom' || g, 'Prénom' || g, '' FROM generate_series(1, ${FILLER_ROWS}) g`
    );

    // Cas frontières : trim, ligatures/accents, ayants droit et mandataires
    // partiels, ligne déjà à jour, ligne sans nom (hors périmètre), et une
    // ligne au jsonb MALFORMÉ (`{}`/nombre au lieu d'un tableau — une
    // validation trouée a laissé passer ce genre de valeur) : elle doit être
    // indexée sur l'identité seule, pas faire avorter toute la migration.
    await dataSource.query(
      `INSERT INTO usager (ref, nom, prenom, surnom, "customRef", "ayantsDroits", options, nom_prenom_surnom_ref)
       VALUES
         (9001, '  Œuvré  ', ' François ', NULL, NULL, NULL, '{}', ''),
         (9002, 'Petit', 'Anna', 'Nana', 'DOSSIER-42',
          '[{"nom":"Petit","prenom":"Zoé"},{"prenom":"Lou"}]',
          '{"procurations":[{"nom":"Mandataire","prenom":"Paul"},{"nom":null}]}', ''),
         (9003, 'Déjà', 'Àjour', NULL, NULL, NULL, '{}', 'deja ajour'),
         (9004, NULL, 'SansNom', NULL, NULL, NULL, '{}', 'valeur-preexistante'),
         (9005, 'Malformé', 'Jsonb', NULL, NULL, '{}', '{"procurations": 5}', '')`
    );

    // Une fratrie nombreuse aux noms à forte entropie (hashes déterministes) :
    // le plafond btree de 2704 octets s'applique APRÈS compression du tuple —
    // des noms répétitifs se compressent sous la limite et ne prouveraient
    // rien. Avec l'index en place, cette ligne fait avorter le rattrapage et
    // rend le dossier non modifiable ; c'est le scénario que le DROP INDEX
    // élimine.
    const bigAyantsDroits = Array.from({ length: 80 }, (_, i) => ({
      nom: createHash("sha256").update(`ad-nom-${i}`).digest("hex"),
      prenom: createHash("sha256").update(`ad-prenom-${i}`).digest("hex"),
    }));
    await dataSource.query(
      `INSERT INTO usager (ref, nom, prenom, "ayantsDroits", nom_prenom_surnom_ref)
       VALUES (9006, 'Grande', 'Fratrie', $1, '')`,
      [JSON.stringify(bigAyantsDroits)]
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
    expect(rows).toHaveLength(FILLER_ROWS + 6);

    const eligibleRows = rows.filter((row) => row.nom && row.prenom);
    expect(eligibleRows).toHaveLength(FILLER_ROWS + 5);

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

  it("supprime l'index btree, qui plafonnait la ligne à 2704 octets", async () => {
    const indexes: { indexname: string }[] = await dataSource.query(
      `SELECT indexname FROM pg_indexes
        WHERE schemaname = $1 AND tablename = 'usager'`,
      [SCHEMA]
    );
    expect(indexes.map((index) => index.indexname)).not.toContain(
      "IDX_f072e2874bd87ecb6da2fbd66e"
    );

    // Et la ligne volumineuse a bien été indexée entière.
    const [row] = await dataSource.query(
      `SELECT length(nom_prenom_surnom_ref) AS len FROM usager WHERE ref = 9006`
    );
    expect(Number(row.len)).toBeGreaterThan(2704);
  });

  it("indexe l'identité seule quand le jsonb n'est pas un tableau", async () => {
    const [row] = await dataSource.query(
      `SELECT nom_prenom_surnom_ref FROM usager WHERE ref = 9005`
    );
    expect(row.nom_prenom_surnom_ref).toBe("malforme jsonb");
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
