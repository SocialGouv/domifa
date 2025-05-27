import { MigrationInterface, QueryRunner } from "typeorm";
import { appLogger, cleanPath } from "../util";
import { structureDocRepository } from "../database";
import { join } from "node:path";
import { FileManagerService } from "../util/file-manager/file-manager.service";
import { CommonDoc, StructureDoc } from "@domifa/common";
import { createHash } from "node:crypto";
import { Readable } from "node:stream";

type Docs = StructureDoc & {
  structureUuid: string;
};
export class EncryptStructureDocsMigration1748264443999
  implements MigrationInterface
{
  public fileManagerService: FileManagerService;
  public processedCount = 0;
  public notFoundCount = 0;
  public errorCount = 0;
  public errors: Array<{ filePath: string; error: string }> = [];
  public processedSinceLastPause = 0;

  constructor() {
    this.fileManagerService = new FileManagerService();
  }
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  public async up(_queryRunner: QueryRunner): Promise<void> {
    appLogger.warn("[MIGRATION] Encrypt structure docs");

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
    const pLimit = (await import("p-limit")).default;

    const limit = pLimit(2);

    const promises = unencryptedDocs.map((doc) =>
      limit(() => this.processWithPause(doc))
    );

    await Promise.all(promises);

    const totalDocs = unencryptedDocs.length;
    const successRate =
      totalDocs > 0
        ? ((this.processedCount / totalDocs) * 100).toFixed(1)
        : "0";

    const migrationSummary = {
      "Total documents": totalDocs,
      "✅ Success": this.processedCount,
      "🔴 Files not found": this.notFoundCount,
      "🟠 Processing errors": this.errorCount,
      "📊 Success rate": `${successRate}%`,
    };

    appLogger.warn("MIGRATION SUMMARY");
    console.table(migrationSummary);

    if (this.errors.length > 0) {
      appLogger.error("Error details:");
      console.table(this.errors);
    }

    if (this.processedCount === totalDocs) {
      appLogger.info("🎉 Migration completed successfully!");
    } else {
      appLogger.warn("⚠️ Migration completed with errors");
    }
  }

  public processWithPause = async (doc: Docs) => {
    await this.processDoc(doc);
    this.processedSinceLastPause++;

    if (this.processedSinceLastPause >= 4) {
      this.processedSinceLastPause = 0;

      appLogger.info("⏸️ Wait one second ");
      await new Promise((resolve) => setTimeout(resolve, 3000));
    }
  };

  public async processDoc(doc: Docs) {
    const filePath = join(
      "structure-documents",
      cleanPath(`${doc.structureId}`),
      doc.path
    );

    try {
      const fileExists = await this.fileManagerService.fileExists(filePath);
      if (!fileExists) {
        appLogger.error(`🔴 File not found: ${filePath}`);
        await this.incrementCounter("notFoundCount");
      } else {
        appLogger.info(`⌛ Processing : ${filePath}`);

        const encryptionContext = crypto.randomUUID();
        const newFilePath = join(
          "structure-documents-encrypted",
          cleanPath(`${doc.structureUuid}`),
          `${doc.path}.sfe`
        );

        let object = await this.fileManagerService.getFileBody(filePath);
        await this.fileManagerService.saveEncryptedFile(
          newFilePath,
          { ...doc, encryptionContext },
          object
        );

        object = null;

        const isIntact = await this.compareFileIntegrity(
          filePath,
          newFilePath,
          {
            ...doc,
            encryptionContext,
          }
        );

        if (!isIntact) {
          await this.incrementCounter("errorCount");
        }

        await structureDocRepository.update(
          { uuid: doc.uuid },
          {
            encryptionContext,
            encryptionVersion: 0,
          }
        );

        appLogger.info(`✅ encypt done : ${doc.structureUuid} ${filePath}`);
        await this.incrementCounter("processedCount");
      }
    } catch (error) {
      appLogger.error(
        `🟠 Error during encryption: ${doc.structureUuid}   ${filePath} - ${error.message}`
      );
      this.errors.push({ filePath, error: error.message });

      await this.incrementCounter("errorCount");
    }
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  public async down(_queryRunner: QueryRunner): Promise<void> {}

  public async calculateStreamHash(stream: Readable): Promise<string> {
    const hash = createHash("sha256");
    for await (const chunk of stream) {
      hash.update(chunk);
    }
    return hash.digest("hex");
  }

  private async compareFileIntegrity(
    originalPath: string,
    encryptedPath: string,
    doc: CommonDoc
  ): Promise<boolean> {
    try {
      const originalStream = await this.fileManagerService.getFileBody(
        originalPath
      );
      const decryptedStream =
        await this.fileManagerService.getDecryptedFileStream(
          encryptedPath,
          doc
        );

      const [originalHash, decryptedHash] = await Promise.all([
        this.calculateStreamHash(originalStream),
        this.calculateStreamHash(decryptedStream),
      ]);

      const isIntact = originalHash === decryptedHash;

      appLogger.info(`🔍 ${originalPath}`);
      appLogger.info(`   Original:  ${originalHash.substring(0, 16)}...`);
      appLogger.info(`   Decrypted: ${decryptedHash.substring(0, 16)}...`);
      appLogger.info(`   Status: ${isIntact ? "✅ OK" : "❌ CORRUPTED"}`);

      if (!isIntact) {
        appLogger.error(`🔴 CORRUPTION DETECTED: ${originalPath}`);
      }

      return isIntact;
    } catch (error) {
      appLogger.error(
        `🔴 Comparison failed for ${originalPath}: ${error.message}`
      );
      return false;
    }
  }
  private async incrementCounter(
    counter: "processedCount" | "errorCount" | "notFoundCount"
  ): Promise<void> {
    this[counter] = this[counter] + 1;
  }
}
