import * as path from "path";
import { DataSource, Repository } from "typeorm";
import { UsagerTable } from "../UsagerTable.typeorm";
import { UsagerSubscriber } from "../UsagerSubscriber.typeorm";
import { computeUsagerSearchIndex } from "../computeUsagerSearchIndex";

// Le subscriber ne voit que le payload : `repository.update()` ne charge pas
// la ligne. Recalculer l'index depuis un payload où un champ indexé MANQUE le
// tronquerait — un dossier introuvable par le nom de son mandataire après une
// simple décision. Le contrat est donc :
//
// - un chemin qui modifie un champ indexé pose `nom_prenom_surnom_ref`
//   lui-même, calculé par `computeUsagerSearchIndex` sur l'entité complète
//   (c'est ce que font `editProcuration`, `deleteProcuration`, `setDecision`
//   et `patchUsager`) ;
// - le subscriber ne recalcule en update que si les SIX champs indexés sont
//   présents ; sinon il ne touche à rien — mieux vaut un index périmé qu'un
//   index tronqué.
//
// Chaque cas part d'une ligne NEUVE portant déjà un mandataire et un ayant
// droit : c'est l'état où une troncature se voit. Un même dossier réutilisé
// d'un cas à l'autre avait masqué le bug une première fois.
const DATABASE_URL =
  process.env.DIFFERENTIAL_DATABASE_URL ??
  "postgres://domifa:diffpwd@localhost:55432/domifa_diff";

const SCHEMA = "subscriber_update_diff";

const BASE_INDEX = "dupont marie ref 1 dupont leo bernard alice";

describe("Index de recherche usager — recalcul sur update partiel", () => {
  let dataSource: DataSource;
  let repository: Repository<UsagerTable>;
  let nextRef = 0;

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
        uuid uuid PRIMARY KEY DEFAULT gen_random_uuid(),
        ref integer,
        "structureId" integer,
        nom text,
        prenom text,
        surnom text,
        "customRef" text,
        "ayantsDroits" jsonb DEFAULT '[]',
        options jsonb DEFAULT '{}',
        decision jsonb,
        statut text,
        historique jsonb,
        "etapeDemande" integer,
        "typeDom" text,
        "datePremiereDom" timestamptz,
        "lastInteraction" jsonb,
        "updatedAt" timestamptz,
        version integer DEFAULT 1,
        nom_prenom_surnom_ref text
      )`);

    repository = dataSource.getRepository(UsagerTable);
  }, 60000);

  afterAll(async () => {
    if (dataSource?.isInitialized) {
      await dataSource.query(`DROP SCHEMA IF EXISTS ${SCHEMA} CASCADE`);
      await dataSource.destroy();
    }
  });

  // Une ligne neuve par cas : Dupont Marie, customRef "REF-1", un ayant droit
  // Léo, un mandataire Bernard Alice — l'index de départ contient tout.
  const seedUsager = async (): Promise<{
    uuid: string;
    entity: {
      nom: string;
      prenom: string;
      surnom: string | null;
      customRef: string;
      ayantsDroits: { nom: string; prenom: string }[];
      options: { procurations: { nom: string; prenom: string }[] };
    };
  }> => {
    nextRef += 1;
    const entity = {
      nom: "Dupont",
      prenom: "Marie",
      surnom: null,
      customRef: "REF-1",
      ayantsDroits: [{ nom: "Dupont", prenom: "Leo" }],
      options: { procurations: [{ nom: "Bernard", prenom: "Alice" }] },
    };
    const [row] = await dataSource.query(
      `INSERT INTO usager (ref, "structureId", nom, prenom, surnom, "customRef",
         "ayantsDroits", options, nom_prenom_surnom_ref)
       VALUES ($1, 1, $2, $3, $4, $5, $6, $7, $8)
       RETURNING uuid`,
      [
        nextRef,
        entity.nom,
        entity.prenom,
        entity.surnom,
        entity.customRef,
        JSON.stringify(entity.ayantsDroits),
        JSON.stringify(entity.options),
        computeUsagerSearchIndex(entity),
      ]
    );
    return { uuid: row.uuid, entity };
  };

  const indexOf = async (uuid: string): Promise<string | null> => {
    const [row] = await dataSource.query(
      `SELECT nom_prenom_surnom_ref FROM usager WHERE uuid = $1`,
      [uuid]
    );
    return row.nom_prenom_surnom_ref;
  };

  it("la ligne de départ indexe bien identité, ayant droit et mandataire", async () => {
    const { uuid } = await seedUsager();
    expect(await indexOf(uuid)).toBe(BASE_INDEX);
  });

  it("payload d'editProcuration : le nouveau mandataire remplace l'ancien dans l'index", async () => {
    const { uuid, entity } = await seedUsager();
    entity.options.procurations = [{ nom: "Moreau", prenom: "Jeanne" }];

    await repository.update(
      { uuid },
      {
        updatedAt: new Date(),
        options: entity.options as never,
        nom_prenom_surnom_ref: computeUsagerSearchIndex(entity),
      }
    );

    expect(await indexOf(uuid)).toBe("dupont marie ref 1 dupont leo moreau jeanne");
  });

  it("payload de setDecision : la référence est indexée SANS perdre le mandataire", async () => {
    const { uuid, entity } = await seedUsager();
    entity.customRef = "DOSSIER-2026";

    // Copie du payload de `setDecision` (usagers.service.ts) : il ne porte
    // pas `options` — l'index est posé explicitement, calculé sur l'entité
    // complète.
    await repository.update(
      { uuid },
      {
        customRef: entity.customRef,
        statut: "VALIDE",
        nom_prenom_surnom_ref: computeUsagerSearchIndex(entity),
      }
    );

    expect(await indexOf(uuid)).toBe(
      "dupont marie dossier 2026 dupont leo bernard alice"
    );
  });

  it("payload de patchUsager : l'état civil change SANS perdre le mandataire", async () => {
    const { uuid, entity } = await seedUsager();
    const dto = {
      nom: "Durand",
      prenom: "Marie",
      surnom: "Mimi",
      customRef: "REF-1",
      ayantsDroits: entity.ayantsDroits,
    };

    // Copie du payload de `patchUsager` : le DTO d'état civil ne porte pas
    // `options`, l'index est calculé sur l'entité fusionnée.
    await repository.update(
      { uuid },
      {
        ...(dto as never as Partial<UsagerTable>),
        nom_prenom_surnom_ref: computeUsagerSearchIndex({
          ...entity,
          ...dto,
        }),
      }
    );

    expect(await indexOf(uuid)).toBe(
      "durand marie mimi ref 1 dupont leo bernard alice"
    );
  });

  it("garde du subscriber : identité sans options ne TRONQUE pas l'index", async () => {
    const { uuid } = await seedUsager();

    // Le payload qui a créé la régression du tour 2 : nom et prénom présents,
    // options absent. Sans la garde, le subscriber recalculait un index
    // amputé du mandataire.
    await repository.update(
      { uuid },
      {
        nom: "Dupont",
        prenom: "Marie",
        surnom: null as never,
        customRef: "REF-1",
        ayantsDroits: [{ nom: "Dupont", prenom: "Leo" }] as never,
      }
    );

    expect(await indexOf(uuid)).toBe(BASE_INDEX);
  });

  it("garde du subscriber : un payload sans champ indexé ne touche pas l'index", async () => {
    const { uuid } = await seedUsager();

    await repository.update({ uuid }, { updatedAt: new Date() });

    expect(await indexOf(uuid)).toBe(BASE_INDEX);
  });

  it("subscriber : un payload COMPLET est recalculé sans valeur explicite", async () => {
    const { uuid, entity } = await seedUsager();

    await repository.update(
      { uuid },
      {
        nom: "Petit",
        prenom: "Anna",
        surnom: entity.surnom as never,
        customRef: entity.customRef,
        ayantsDroits: entity.ayantsDroits as never,
        options: entity.options as never,
      }
    );

    expect(await indexOf(uuid)).toBe("petit anna ref 1 dupont leo bernard alice");
  });
});
