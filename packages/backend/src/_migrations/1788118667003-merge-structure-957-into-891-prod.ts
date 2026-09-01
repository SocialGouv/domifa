import { MigrationInterface, QueryRunner } from "typeorm";
import { StructuresMergeService } from "../modules/structures/services";
import { StructureMergeOptions } from "../modules/structures/types/structures-merge.types";
import { appLogger } from "../util";
import { domifaConfig } from "../config";

// Same values as the validated analysis migration. refOffset is computed at
// start (max ref of the target).
const OPTIONS: StructureMergeOptions = {
  source: 957,
  target: 891,
  customRef: { type: "prefix", value: "F-" },
};

// Resumable: dossier by dossier, each in its own transaction, then a final
// sweep of everything still attached to the source. If it stops, the
// migration is not recorded and runs again at next start, continuing where
// it stopped (only rows still on the source are touched).
export class MergeStructure957Into891Prod1788118667003
  implements MigrationInterface
{
  name = "MergeStructure957Into891Prod1788118667003";

  public async up(queryRunner: QueryRunner): Promise<void> {
    if (domifaConfig().envId !== "prod") {
      return;
    }
    const result = await new StructuresMergeService().merge(
      queryRunner,
      OPTIONS
    );
    appLogger.warn(`[structures-merge] merge done`, result);
  }

  public async down(): Promise<void> {
    throw new Error(
      "[structures-merge] not reversible: restore the database backup taken before the merge"
    );
  }
}
