import { encryptFile } from "@socialgouv/streaming-file-encryption";
import { createDecipheriv, randomUUID } from "crypto";
import {
  pathExists,
  stat,
  createReadStream,
  createWriteStream,
} from "fs-extra";
import { pipeline } from "node:stream/promises";
import { join } from "path";
import { domifaConfig } from "../../config";
import { structureRepository, usagerDocsRepository } from "../../database";
import { getFileDir, compressAndResizeImage, getNewFileDir } from "../../util";
import { IsNull } from "typeorm";
import { Structure, UsagerDoc } from "../../_common/model";

export const migrateOldFiles = async () => {
  while ((await countMigratedStructures()) > 0) {
    let totalCount = 0;

    const structure = await structureRepository.findOneBy({
      filesUpdated: false,
    });

    console.info(
      "Start migration for structure N*" + structure.id + " - " + new Date()
    );

    const oldFiles: Pick<
      UsagerDoc,
      "structureId" | "uuid" | "usagerRef" | "path" | "usagerUUID" | "filetype"
    >[] = await usagerDocsRepository.find({
      where: {
        structureId: structure.id,
        encryptionContext: IsNull(),
      },
      select: {
        structureId: true,
        uuid: true,
        usagerRef: true,
        path: true,
        usagerUUID: true,
        filetype: true,
      },
    });

    totalCount = oldFiles.length;
    let cpt = 1;

    for (const doc of oldFiles) {
      console.info(
        `>>> Migration structure N* ${structure.id} : ${cpt++} / ${totalCount}`
      );
      await decryptOldFile(doc, structure);
    }

    console.info(
      "End of migration for structure N*" + structure.id + " - " + new Date()
    );

    await structureRepository.update(
      { uuid: structure.uuid },
      {
        filesUpdated: true,
      }
    );
  }
};

export const decryptOldFile = async (
  usagerDoc: Pick<
    UsagerDoc,
    "structureId" | "uuid" | "usagerRef" | "path" | "usagerUUID" | "filetype"
  >,
  structure: Structure
): Promise<void> => {
  const encryptionContext = randomUUID();
  const mainSecret = domifaConfig().security.files.mainSecret;
  const key = domifaConfig().security.files.private;

  // Anciens dossiers et fichiers
  const sourceFileDir = getFileDir(usagerDoc.structureId, usagerDoc.usagerRef);
  let sourceFilePath = join(sourceFileDir, usagerDoc.path + ".encrypted");

  // Le fichier de sortie ne sera pas au même endroit que la source
  const outputFileDir = await getNewFileDir(
    structure.uuid,
    usagerDoc.usagerUUID
  );

  const outputFilePathSfe = join(outputFileDir, usagerDoc.path + ".sfe");

  if (await pathExists(outputFilePathSfe)) {
    // fichier déjà chiffré, DB pas à jour ?
    console.error(`Fichier ${outputFilePathSfe} déjà existant`);
  } else if (await pathExists(sourceFilePath)) {
    // fichier déjà chiffré avec ancienne methode
    // TEMP FIX : Utiliser la deuxième clé d'encryptage générée le 30 juin
    // A supprimer une fois que les fichiers seront de nouveaux regénérés
    const docInfos = await stat(sourceFilePath);

    const iv =
      docInfos.mtime < new Date("2021-06-30T23:01:01.113Z")
        ? domifaConfig().security.files.ivSecours
        : domifaConfig().security.files.iv;

    try {
      const decipher = createDecipheriv("aes-256-cfb", key, iv);
      if (
        usagerDoc.filetype === "image/jpeg" ||
        usagerDoc.filetype === "image/png"
      ) {
        await pipeline(
          createReadStream(sourceFilePath),
          decipher,
          compressAndResizeImage(usagerDoc),
          encryptFile(mainSecret, encryptionContext),
          createWriteStream(outputFilePathSfe)
        );
      } else {
        await pipeline(
          createReadStream(sourceFilePath),
          decipher,
          encryptFile(mainSecret, encryptionContext),
          createWriteStream(outputFilePathSfe)
        );
      }

      await usagerDocsRepository.update(
        { uuid: usagerDoc.uuid },
        { encryptionContext, encryptionVersion: 0 }
      );
    } catch (e) {
      console.error("ENCRYPTED FILE");
      console.error(e);
      console.error({ usagerDoc });
    }
  } else {
    // Dernier cas : fichier jamais chiffré
    sourceFilePath = join(sourceFileDir, usagerDoc.path);
    if (await pathExists(sourceFilePath)) {
      {
        try {
          if (
            usagerDoc.filetype === "image/jpeg" ||
            usagerDoc.filetype === "image/png"
          ) {
            await pipeline(
              createReadStream(sourceFilePath),
              compressAndResizeImage(usagerDoc),
              encryptFile(mainSecret, encryptionContext),
              createWriteStream(outputFilePathSfe)
            );
          } else {
            await pipeline(
              createReadStream(sourceFilePath),
              encryptFile(mainSecret, encryptionContext),
              createWriteStream(outputFilePathSfe)
            );
          }

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
          console.error("UNENCRYPTED FILE");
          console.error(e);
          console.error({ usagerDoc });
        }
      }
    } else {
      // fichier source non trouvé
      console.error(
        "File not found for usager N*" +
          usagerDoc.usagerRef +
          " from structure n*" +
          usagerDoc.structureId
      );

      console.error({ usagerDoc });

      await usagerDocsRepository.delete({
        uuid: usagerDoc.uuid,
      });
    }
  }
};

function countMigratedStructures(): Promise<number> {
  return structureRepository.count({
    where: {
      filesUpdated: false,
    },
  });
}
