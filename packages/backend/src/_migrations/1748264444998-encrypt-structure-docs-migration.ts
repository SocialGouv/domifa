import { MigrationInterface, QueryRunner } from "typeorm";
import { appLogger, cleanPath } from "../util";
import { structureDocRepository } from "../database";
import { join } from "node:path";
import { FileManagerService } from "../util/file-manager/file-manager.service";
import { StructureDoc } from "@domifa/common";

type Docs = StructureDoc & {
  structureUuid: string;
};
export class EncryptStructureDocsMigration1748264444998
  implements MigrationInterface
{
  public fileManagerService: FileManagerService;

  constructor() {
    this.fileManagerService = new FileManagerService();
  }
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  public async up(_queryRunner: QueryRunner): Promise<void> {
    appLogger.warn("[MIGRATION] Encrypt structure docs");

    await structureDocRepository.update({}, { encryptionContext: null });

    const unencryptedDocs: Docs[] = await structureDocRepository
      .createQueryBuilder("structure_doc")
      .leftJoin(
        "structure",
        "structure",
        `structure."id" = structure_doc."structureId"`
      )
      .where(`structure_doc."encryptionContext" IS NULL`)
      .select([
        `structure_doc."uuid" as "uuid"`,
        `structure_doc."structureId" as "structureId"`,
        `structure_doc."path" as "path"`,
        `structure_doc."filetype" as "filetype"`,
        `structure_doc."encryptionContext" as "encryptionContext"`,
        `structure."uuid" as "structureUuid"`,
      ])
      .getRawMany();

    appLogger.warn(
      `[MIGRATION] ${unencryptedDocs.length} documents to encrypt`
    );

    let processedCount = 0;
    let notFoundCount = 0;
    let errorCount = 0;

    const errors: Array<{ filePath: string; error: string }> = [];

    for (const doc of unencryptedDocs) {
      const filePath = join(
        "structure-documents",
        cleanPath(`${doc.structureId}`),
        doc.path
      );

      try {
        const fileExists = await this.fileManagerService.fileExists(filePath);
        if (!fileExists) {
          appLogger.error(`🔴 File not found: ${filePath}`);
          notFoundCount++;
          continue;
        }

        appLogger.info(`⌛ Processing : ${filePath}`);

        const encryptionContext = crypto.randomUUID();
        const newFilePath = join(
          "structure-documents-encrypted",
          cleanPath(`${doc.structureUuid}`),
          `${doc.path}.sfe`
        );

        const object = await this.fileManagerService.getFileBody(filePath);
        await this.fileManagerService.saveEncryptedFile(
          newFilePath,
          { ...doc, encryptionContext },
          object
        );

        await structureDocRepository.update(
          { uuid: doc.uuid },
          {
            encryptionContext,
            encryptionVersion: 0,
          }
        );

        appLogger.info(`✅ encypt done : ${doc.structureUuid} ${filePath}`);
        processedCount++;
      } catch (error) {
        appLogger.error(
          `🟠 Error during encryption: ${doc.structureUuid}   ${filePath} - ${error.message}`
        );
        errors.push({ filePath, error: error.message });
        errorCount++;
      }
    }

    const totalDocs = unencryptedDocs.length;
    const successRate =
      totalDocs > 0 ? ((processedCount / totalDocs) * 100).toFixed(1) : "0";

    const migrationSummary = {
      "Total documents": totalDocs,
      "✅ Success": processedCount,
      "🔴 Files not found": notFoundCount,
      "🟠 Processing errors": errorCount,
      "📊 Success rate": `${successRate}%`,
    };

    appLogger.warn("MIGRATION SUMMARY");
    console.table(migrationSummary);

    if (errors.length > 0) {
      appLogger.error("Error details:");
      console.table(errors);
    }

    if (processedCount === totalDocs) {
      appLogger.info("🎉 Migration completed successfully!");
    } else {
      appLogger.warn("⚠️ Migration completed with errors");
    }
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  public async down(_queryRunner: QueryRunner): Promise<void> {}
}
