import { HttpException, HttpStatus } from "@nestjs/common";
import * as fs from "fs";
import * as path from "path";
import { domifaConfig } from "../../config/domifaConfig.service";
import { interactionRepository, usagerRepository } from "../../database";
import { usagerHistoryRepository } from "../../database/services/usager/usagerHistoryRepository.service";
import { appLogger } from "../../util";

export const usagerDeletor = { deleteUsager };

async function deleteUsager({
  usagerRef,
  structureId,
}: {
  usagerRef: number;
  structureId: number;
}): Promise<number> {
  await usagerHistoryRepository.deleteByCriteria({
    usagerRef,
    structureId,
  });

  await interactionRepository.deleteByCriteria({
    usagerRef,
    structureId,
  });

  const pathFile = path.resolve(
    path.join(domifaConfig().upload.basePath, `${structureId}`, `${usagerRef}`)
  );

  // TODO: basculer sur une suppression asynchrone
  deleteUsagerFolder(pathFile);

  const usagerToDelete = await usagerRepository.deleteByCriteria({
    ref: usagerRef,
    structureId,
  });

  return usagerToDelete;
}

function deleteUsagerFolder(pathFile: string) {
  if (fs.existsSync(pathFile)) {
    fs.readdir(pathFile, (err, files) => {
      if (err) {
        appLogger.error("CANNOT_READ_FOLDER: pathFile = " + pathFile);
        throw new HttpException(
          {
            message:
              "CANNOT_READ_FOLDER : " +
              pathFile +
              "\n Err: " +
              JSON.stringify(err),
          },
          HttpStatus.INTERNAL_SERVER_ERROR
        );
      }

      for (const file of files) {
        try {
          appLogger.debug("[FILES LOGS] Delete file in folder success");
          fs.unlinkSync(path.join(pathFile, file));
        } catch (err) {
          appLogger.error(
            "[FILES LOGS] Cannot delete file ( " +
              file +
              ") in folder  " +
              pathFile
          );
          throw new HttpException(
            {
              message:
                "CANNOT_DELETE_USAGER_FOLDER_FILE: " +
                file +
                "\n Err: " +
                JSON.stringify(err),
            },
            HttpStatus.INTERNAL_SERVER_ERROR
          );
        }
      }
    });
  }
}
