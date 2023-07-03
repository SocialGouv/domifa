/* eslint-disable @typescript-eslint/no-unused-vars */
import { move, pathExists } from "fs-extra";
import { join } from "path";

import { MigrationInterface, QueryRunner } from "typeorm";
import { domifaConfig } from "../config";

export class ManualMigration1688386262528 implements MigrationInterface {
  public name?: string = "migrateCustomDocs1688386262528";
  public async up(_queryRunner: QueryRunner): Promise<void> {
    const docs = await _queryRunner.query(
      `SELECT "structureId" FROM structure_doc GROUP BY "structureId"`
    );

    const structureIds = docs.map(
      (result: { structureId: number }) => result.structureId
    );

    for await (const structureId of structureIds) {
      const input = join(
        domifaConfig().upload.basePath,
        `${structureId}`,
        "docs"
      );

      if (await pathExists(input)) {
        const output = join(
          domifaConfig().upload.basePath,
          "structure-documents",
          `${structureId}`
        );

        await move(input, output);
      }
    }
  }

  // eslint-disable-next-line @typescript-eslint/no-empty-function
  public async down(_queryRunner: QueryRunner): Promise<void> {}
}
