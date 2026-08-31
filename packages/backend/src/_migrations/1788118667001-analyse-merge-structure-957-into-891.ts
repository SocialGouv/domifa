import { MigrationInterface, QueryRunner } from "typeorm";
import { StructuresMergeService } from "../modules/structures/services";
import { StructureMergeOptions } from "../modules/structures/types/structures-merge.types";
import { appLogger } from "../util";
import { domifaConfig } from "../config";

// Read-only: logs the full figures of the merge, writes nothing.
const OPTIONS: StructureMergeOptions = {
  source: 957,
  target: 891,
  customRef: { type: "prefix", value: "F-" },
};

export class AnalyseMergeStructure957Into8911788118667001
  implements MigrationInterface
{
  name = "AnalyseMergeStructure957Into8911788118667001";

  public async up(queryRunner: QueryRunner): Promise<void> {
    if (
      domifaConfig().envId === "dev" ||
      domifaConfig().envId === "local" ||
      domifaConfig().envId === "test"
    ) {
      return;
    }
    const service = new StructuresMergeService();
    const preflight = await service.preflight(queryRunner, OPTIONS);
    if (!preflight) {
      appLogger.warn(
        `[structures-merge] analysis skipped: structures #${OPTIONS.source} / #${OPTIONS.target} not found or identical`
      );
      return;
    }
    service.logPreflight(preflight);
  }

  public async down(): Promise<void> {
    return;
  }
}
