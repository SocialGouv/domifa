import { MigrationInterface, QueryRunner } from "typeorm";
import { computeUsagerSearchIndex } from "../database/entities/usager/computeUsagerSearchIndex";
import { appLogger } from "../util";

const BATCH_SIZE = 2000;

type UsagerSearchRow = {
  uuid: string;
  nom: string;
  prenom: string;
  surnom: string | null;
  customRef: string | null;
  ref: number;
  ayantsDroits: { nom?: string; prenom?: string }[] | null;
  options: { procurations?: { nom?: string; prenom?: string }[] } | null;
};

// `nom_prenom_surnom_ref` indexe désormais aussi les ayants droit et les
// mandataires, pour que la recherche serveur trouve un dossier par le nom d'un
// enfant ou d'un mandataire — ce que fait déjà la recherche de l'interface.
// Le subscriber alimente les lignes écrites après ce déploiement ; celle-ci
// rattrape l'existant.
//
// Le recalcul passe par `computeUsagerSearchIndex` — LA règle de l'index,
// partagée avec le subscriber — et non par une transposition SQL : la
// décomposition NFKD, le repli des ligatures et le remplacement des caractères
// non alphanumériques n'ont pas d'équivalent exact en SQL, et deux
// implémentations divergeraient.
//
// Les migrations tournent HORS transaction : en production elles sont jouées
// par `initialize()` (`migrationsRun`) avec `migrationsTransactionMode:
// "none"` — et `appTypeormManager.migrateUp` suit le même régime, sur une
// liste déjà vide. Chaque lot est donc
// commité immédiatement : une erreur laisse le travail accompli en place, et
// `IS DISTINCT FROM` rend la reprise gratuite — elle saute les lignes déjà à
// jour (subscriber, exécution précédente). L'écriture par lot — un seul
// `UPDATE … FROM (VALUES …)` pour 2000 lignes — évite un aller-retour réseau
// par ligne vers la base managée.
export class BackfillUsagerSearchIndex1786500000000
  implements MigrationInterface
{
  name = "backfillUsagerSearchIndex1786500000000";

  public async up(queryRunner: QueryRunner): Promise<void> {
    // Le btree sur `nom_prenom_surnom_ref` ne sert rien (la colonne n'est lue
    // qu'en `ILIKE '%…%'`, qu'un btree ne peut pas servir) et il plafonne le
    // tuple à 2704 octets APRÈS compression — l'index enrichi n'a pas de
    // borne : au-delà, cette migration avorterait et toute écriture du
    // dossier renverrait 500, le dossier devenant définitivement non
    // modifiable. Supprimé AVANT le rattrapage ; non recréé à la redescente.
    // CONCURRENTLY — possible puisque hors transaction — pour ne pas faire la
    // queue en ACCESS EXCLUSIVE derrière une requête longue : un DROP nu
    // gèlerait tout le trafic dossiers pendant le déploiement. Interrompu, il
    // laisse un index INVALID, invisible des plans mais toujours maintenu en
    // écriture (le plafond des 2704 octets tient donc toujours) — la
    // migration a alors échoué, et son rejeu supprime l'index invalide.
    await queryRunner.query(
      `DROP INDEX CONCURRENTLY IF EXISTS "IDX_f072e2874bd87ecb6da2fbd66e"`
    );

    let lastUuid: string | null = null;
    let processed = 0;
    let updated = 0;

    for (;;) {
      const rows: UsagerSearchRow[] = await queryRunner.query(
        `SELECT uuid, nom, prenom, surnom, "customRef", ref, "ayantsDroits", options
           FROM usager
          WHERE nom IS NOT NULL AND prenom IS NOT NULL
            AND ($1::uuid IS NULL OR uuid > $1::uuid)
          ORDER BY uuid
          LIMIT ${BATCH_SIZE}`,
        [lastUuid]
      );

      if (rows.length === 0) {
        break;
      }

      const parameters: string[] = [];
      const tuples = rows.map((row) => {
        // Une erreur ici interrompt la migration et bloque le déploiement.
        // Sans l'uuid, elle serait inexploitable en astreinte.
        try {
          parameters.push(row.uuid, computeUsagerSearchIndex(row));
        } catch (error) {
          throw new Error(
            `[backfillUsagerSearchIndex] usager ${row.uuid}: ${
              (error as Error).message
            }`
          );
        }
        return `($${parameters.length - 1}::uuid, $${parameters.length}::text)`;
      });

      // Même exigence de diagnosticabilité que le calcul par ligne : une
      // erreur du lot (contrainte, encodage…) doit borner l'intervalle
      // d'uuid en cause.
      let result: unknown;
      try {
        result = await queryRunner.query(
          `UPDATE usager
              SET nom_prenom_surnom_ref = batch.search_index
             FROM (VALUES ${tuples.join(", ")}) AS batch(uuid, search_index)
            WHERE usager.uuid = batch.uuid
              AND usager.nom_prenom_surnom_ref IS DISTINCT FROM batch.search_index`,
          parameters
        );
      } catch (error) {
        throw new Error(
          `[backfillUsagerSearchIndex] batch ${rows[0].uuid}..${
            rows[rows.length - 1].uuid
          }: ${(error as Error).message}`
        );
      }
      // le query runner postgres de TypeORM renvoie [rows, rowCount] pour un UPDATE
      updated += Array.isArray(result) ? Number(result[1]) : 0;

      processed += rows.length;
      lastUuid = rows[rows.length - 1].uuid;
      appLogger.warn(
        `[backfillUsagerSearchIndex] ${processed} usagers parcourus, ${updated} réindexés`
      );
    }
  }

  // Irréversible par nature : l'ancienne valeur n'est pas conservée. La
  // redescente laisse l'index enrichi, qui reste un sur-ensemble correct de ce
  // que l'ancien code y mettait — aucune recherche existante n'en pâtit.
  public async down(): Promise<void> {
    return;
  }
}
