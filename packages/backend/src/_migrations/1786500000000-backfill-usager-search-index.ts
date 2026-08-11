import { MigrationInterface, QueryRunner } from "typeorm";
import { normalizeString } from "@domifa/common";
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
// Le recalcul passe par la même fonction `normalizeString` que le subscriber,
// et non par une transposition SQL : la décomposition NFKD, le repli des
// ligatures et le remplacement des caractères non alphanumériques n'ont pas
// d'équivalent exact en SQL, et deux implémentations divergeraient.
export class BackfillUsagerSearchIndex1786500000000
  implements MigrationInterface
{
  name = "backfillUsagerSearchIndex1786500000000";

  public async up(queryRunner: QueryRunner): Promise<void> {
    let lastUuid: string | null = null;
    let processed = 0;

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

      for (const row of rows) {
        const parts = [
          row.nom?.trim(),
          row.prenom?.trim(),
          row.surnom,
          row.customRef,
          ...(row.ayantsDroits ?? []).flatMap((ayantDroit) => [
            ayantDroit?.nom,
            ayantDroit?.prenom,
          ]),
          ...(row.options?.procurations ?? []).flatMap((procuration) => [
            procuration?.nom,
            procuration?.prenom,
          ]),
        ].filter(Boolean);

        await queryRunner.query(
          `UPDATE usager SET nom_prenom_surnom_ref = $1 WHERE uuid = $2`,
          [normalizeString(parts.join(" ")), row.uuid]
        );
      }

      processed += rows.length;
      lastUuid = rows[rows.length - 1].uuid;
      appLogger.warn(
        `[backfillUsagerSearchIndex] ${processed} usagers réindexés`
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
