import { UsagerDoc } from "./../../_common/model/usager/UsagerDoc.type";
import { usagerDocsRepository } from "./../../database/services/usager/usagerDocsRepository.service";
import { Injectable } from "@nestjs/common";
import { Cron } from "@nestjs/schedule";
import { domifaConfig } from "../../config";
import { isCronEnabled } from "../../config/services/isCronEnabled.service";
import { appLogger, getFileDir } from "../../util";
import { join } from "path";
import { createReadStream, pathExists, stat } from "fs-extra";
import { createDecipheriv } from "crypto";

import { pipeline } from "node:stream/promises";
import { encryptFile } from "@socialgouv/streaming-file-encryption";
import { createWriteStream } from "fs";

@Injectable()
export class CronMigrateFilesService {
  @Cron(domifaConfig().cron.emailUserGuide.crontime)
  protected async migrateFilesCron() {
    if (!isCronEnabled()) {
      appLogger.warn(`[CRON] [migrateFiles] Disabled by config`);
      return;
    }
    await this.getOldFiles();
  }

  private async getOldFiles() {
    const unEncryptedCount = usagerDocsRepository.count({
      where: {
        encryptionContext: null,
        structureId: 42, // TODO: use specific value here for first tests
      },
    });
    console.log(`unEncryptedCount: ${unEncryptedCount}`);
    const oldFiles = await usagerDocsRepository.find({
      where: {
        encryptionContext: null,
        structureId: 42, // TODO: use specific value here for first tests
      },
      take: 10,
    });

    for (const doc of oldFiles) {
      await this.decryptOldFile(doc);
    }
  }

  private async decryptOldFile(usagerDoc: UsagerDoc) {
    const sourceFileDir = getFileDir(
      usagerDoc.structureId,
      usagerDoc.usagerRef
    );
    // Encrypted file source
    const encryptedFilePath = join(
      sourceFileDir,
      usagerDoc.path + ".encrypted"
    );

    const sfePath = join(sourceFileDir, usagerDoc.path + ".sfe");

    if (await pathExists(sfePath)) {
      // fichier déjà chiffré, DB pas à jour ?
      console.error(`Fichier ${sfePath} déjà existant`);
    } else if (await pathExists(encryptedFilePath)) {
      // fichier déjà chiffré avec ancienne methode
      // TEMP FIX : Utiliser la deuxième clé d'encryptage générée le 30 juin
      // A supprimer une fois que les fichiers seront de nouveaux regénérés
      const docInfos = await stat(encryptedFilePath);

      const iv =
        docInfos.mtime < new Date("2021-06-30T23:01:01.113Z")
          ? domifaConfig().security.files.ivSecours
          : domifaConfig().security.files.iv;

      try {
        const key = domifaConfig().security.files.private;
        const decipher = createDecipheriv("aes-256-cfb", key, iv);

        const mainSecret = domifaConfig().security.files.mainSecret;

        const encryptionContext = crypto.randomUUID();

        // dechiffre le fichier actuel, rechiffre avec SFE
        await pipeline(
          createReadStream(encryptedFilePath),
          decipher,
          encryptFile(mainSecret, encryptionContext),
          createWriteStream(sfePath)
        );

        // MAJ DB
        await usagerDocsRepository.update(
          {
            uuid: usagerDoc.uuid,
          },
          {
            encryptionContext,
            encryptionVersion: 0,
          }
        );
      } catch (e) {
        console.error(e);
      }
    } else {
      // fichier jamais chiffré
      const oldFilePath = join(sourceFileDir, usagerDoc.path);
      if (!(await pathExists(oldFilePath))) {
        // fichier source non trouvé
        appLogger.error("Error reading usager document", {
          sentry: true,
          context: {
            oldFilePath,
          },
        });
      } else {
        // chiffrement du fichier en clair avec SFE et mise à jour DB

        try {
          const mainSecret = domifaConfig().security.files.mainSecret;

          const encryptionContext = crypto.randomUUID();

          // dechiffre le fichier actuel, rechiffre avec SFE
          await pipeline(
            createReadStream(oldFilePath),
            encryptFile(mainSecret, encryptionContext),
            createWriteStream(sfePath)
          );

          // MAJ DB
          await usagerDocsRepository.update(
            {
              uuid: usagerDoc.uuid,
            },
            {
              encryptionContext,
              encryptionVersion: 0,
            }
          );
        } catch (e) {
          console.error(e);
        }
      }
    }
  }
}
