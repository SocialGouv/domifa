import { MigrationInterface, QueryRunner } from "typeorm";
import { domifaConfig } from "../config";
import { usagerDocsRepository } from "../database";
import { appLogger, cleanPath, FileManagerService } from "../util";
import { join } from "node:path";

export class AutoMigration1758029089535 implements MigrationInterface {
  name = "AutoMigration1758029089535";

  public async up(): Promise<void> {
    if (
      domifaConfig().envId === "prod" ||
      domifaConfig().envId === "preprod" ||
      domifaConfig().envId === "local"
    ) {
      await this.processExistingDocuments();
    }
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "usager_docs" DROP COLUMN "filesize"`);
  }

  private async processExistingDocuments(): Promise<void> {
    appLogger.warn(
      "[Migration] Starting filesize processing for existing documents..."
    );

    const fileManagerService = new FileManagerService();
    const batchSize = 500;
    let offset = 0;
    let totalProcessed = 0;
    let totalUpdated = 0;
    let totalNotFound = 0;

    while (true) {
      const documents = await usagerDocsRepository
        .createQueryBuilder("doc")
        .leftJoin("structure", "structure", "structure.id = doc.structureId")
        .leftJoin("usager", "usager", "usager.uuid = doc.usagerUUID")
        .select([
          "doc.uuid as uuid",
          "doc.path as path",
          "doc.filesize as filesize",
          "doc.label as label",
          "structure.uuid as structure_uuid",
          "usager.uuid as usager_uuid",
        ])
        .where("doc.filesize IS NULL")
        .orderBy(`doc."createdAt"`, "ASC")
        .limit(batchSize)
        .offset(offset)
        .getRawMany();

      if (documents.length === 0) {
        break;
      }

      appLogger.warn(
        `[Migration] Processing batch ${
          Math.floor(offset / batchSize) + 1
        }, documents ${offset + 1} to ${offset + documents.length}`
      );

      for (const doc of documents) {
        try {
          const filePath = join(
            "usager-documents",
            cleanPath(doc.structure_uuid),
            cleanPath(doc.usager_uuid),
            `${doc.path}.sfe`
          );

          const filesize = await fileManagerService.getFileSize(filePath);
          await usagerDocsRepository.update({ uuid: doc.uuid }, { filesize });

          if (filesize > 0) {
            totalUpdated++;
            appLogger.debug(
              `[Migration] Updated document ${doc.uuid} (${doc.label}) with size ${filesize} bytes, path: ${filePath}`
            );
          } else if (filesize === -1) {
            totalNotFound++;
            appLogger.warn(
              `[Migration] File not found for document ${doc.uuid} (${doc.label}), path: ${filePath}`
            );
          } else {
            appLogger.warn(
              `[Migration] Unexpected filesize value ${filesize} for document ${doc.uuid} (${doc.label}), path: ${filePath}`
            );
          }
        } catch (error) {
          appLogger.error(
            `[Migration] Error processing document ${doc.uuid}: ${error.message}`
          );
        }
      }

      totalProcessed += documents.length;
      offset += batchSize;

      if (Math.floor(offset / batchSize) % 10 === 0) {
        appLogger.warn(
          `[Migration] Progress: ${totalProcessed} documents processed, ${totalUpdated} updated, ${totalNotFound} not found`
        );
      }

      await new Promise((resolve) => setTimeout(resolve, 100));
    }

    appLogger.warn(`[Migration] FileSize processing completed:`);
    appLogger.warn(
      `[Migration] - Total documents processed: ${totalProcessed}`
    );
    appLogger.warn(`[Migration] - Successfully updated: ${totalUpdated}`);
    appLogger.warn(`[Migration] - Files not found in S3: ${totalNotFound}`);
    appLogger.warn(
      `[Migration] - Errors: ${totalProcessed - totalUpdated - totalNotFound}`
    );
  }
}
