import * as path from "path";
import { DataSource, Repository } from "typeorm";
import { UsagerTable } from "../UsagerTable.typeorm";
import { UsagerSubscriber } from "../UsagerSubscriber.typeorm";

// Le subscriber ne recalcule `nom_prenom_surnom_ref` que si `nom` et `prenom`
// figurent dans le payload de l'update : il ne voit que ce qu'on lui donne,
// `repository.update()` ne charge pas l'entité. Tout chemin d'écriture qui
// modifie un champ indexé (mandataires, ayants droit, `customRef`, surnom)
// doit donc JOINDRE les champs d'identité — c'est ce que font
// `editProcuration`, `deleteProcuration` et `setDecision`.
//
// Ce spec épingle le contrat des deux côtés : sans identité l'index reste
// figé (le dossier deviendrait introuvable par le nom de son mandataire), avec
// identité il est recalculé. Si le subscriber change de règle, ou si un futur
// chemin d'écriture oublie l'identité, c'est ici que ça se voit.
const DATABASE_URL =
  process.env.DIFFERENTIAL_DATABASE_URL ??
  "postgres://domifa:diffpwd@localhost:55432/domifa_diff";

const SCHEMA = "subscriber_update_diff";
const UUID = "22222222-2222-2222-2222-222222222222";

describe("Index de recherche usager — recalcul sur update partiel", () => {
  let dataSource: DataSource;
  let repository: Repository<UsagerTable>;

  beforeAll(async () => {
    dataSource = new DataSource({
      type: "postgres",
      url: DATABASE_URL,
      synchronize: false,
      // Le graphe complet des entités : `UsagerTable` référence structure et
      // notes, TypeORM refuse une métadonnée incomplète.
      entities: [path.join(__dirname, "../../**/*Table.typeorm.ts")],
      subscribers: [UsagerSubscriber],
      extra: { options: `-c search_path=${SCHEMA}` },
    });
    await dataSource.initialize();

    await dataSource.query(`CREATE SCHEMA IF NOT EXISTS ${SCHEMA}`);
    await dataSource.query(`DROP TABLE IF EXISTS ${SCHEMA}.usager`);
    // Seules les colonnes que ces updates touchent : `update()` n'écrit que
    // son payload.
    await dataSource.query(`
      CREATE TABLE ${SCHEMA}.usager (
        uuid uuid PRIMARY KEY,
        ref integer,
        "structureId" integer,
        nom text,
        prenom text,
        surnom text,
        "customRef" text,
        "ayantsDroits" jsonb DEFAULT '[]',
        options jsonb DEFAULT '{}',
        "updatedAt" timestamptz,
        version integer DEFAULT 1,
        nom_prenom_surnom_ref text
      )`);
    await dataSource.query(
      `INSERT INTO usager (uuid, ref, "structureId", nom, prenom, options, "ayantsDroits", nom_prenom_surnom_ref)
       VALUES ($1, 1, 1, 'Dupont', 'Marie', '{"procurations":[]}', '[]', 'dupont marie')`,
      [UUID]
    );

    repository = dataSource.getRepository(UsagerTable);
  }, 60000);

  afterAll(async () => {
    if (dataSource?.isInitialized) {
      await dataSource.query(`DROP SCHEMA IF EXISTS ${SCHEMA} CASCADE`);
      await dataSource.destroy();
    }
  });

  const currentIndex = async (): Promise<string | null> => {
    const [row] = await dataSource.query(
      `SELECT nom_prenom_surnom_ref FROM usager WHERE uuid = $1`,
      [UUID]
    );
    return row.nom_prenom_surnom_ref;
  };

  it("ne recalcule PAS l'index quand l'identité manque — d'où l'obligation de la joindre", async () => {
    const before = await currentIndex();

    await repository.update(
      { uuid: UUID },
      {
        updatedAt: new Date(),
        options: {
          procurations: [{ nom: "Bernard", prenom: "Alice" }],
        } as never,
      }
    );

    expect(await currentIndex()).toBe(before);
  });

  it("recalcule l'index avec le payload d'editProcuration (identité jointe)", async () => {
    await repository.update(
      { uuid: UUID },
      {
        updatedAt: new Date(),
        options: {
          procurations: [{ nom: "Bernard", prenom: "Alice" }],
        } as never,
        nom: "Dupont",
        prenom: "Marie",
        surnom: null as never,
        customRef: null as never,
        ayantsDroits: [] as never,
      }
    );

    expect(await currentIndex()).toBe("dupont marie bernard alice");
  });

  it("retire le mandataire de l'index avec le payload de deleteProcuration", async () => {
    await repository.update(
      { uuid: UUID },
      {
        updatedAt: new Date(),
        options: { procurations: [] } as never,
        nom: "Dupont",
        prenom: "Marie",
        surnom: null as never,
        customRef: null as never,
        ayantsDroits: [] as never,
      }
    );

    expect(await currentIndex()).toBe("dupont marie");
  });

  it("indexe une référence posée à la décision avec le payload de setDecision", async () => {
    await repository.update(
      { uuid: UUID },
      {
        customRef: "DOSSIER-2026",
        nom: "Dupont",
        prenom: "Marie",
        surnom: null as never,
        ayantsDroits: [] as never,
      }
    );

    expect(await currentIndex()).toBe("dupont marie dossier 2026");
  });
});
