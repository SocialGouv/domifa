import * as fs from "fs";
import * as path from "path";
import { domifaConfig } from "../../config/domifaConfig.service";

import { appLogger } from "../../util";

export function deleteUsagerFolder({
  usagerRef,
  structureId,
}: {
  usagerRef: number;
  structureId: number;
}) {
  const pathFile = path.resolve(
    path.join(domifaConfig().upload.basePath, `${structureId}`, `${usagerRef}`)
  );

  if (!fs.existsSync(pathFile)) {
    appLogger.error("Folder not exists - pathFile : " + pathFile);
    return;
  }

  fs.readdir(pathFile, (error, files) => {
    if (error) {
      appLogger.error("Error after folder reading - pathFile : " + pathFile, {
        sentry: true,
        error,
      });
      return;
    }

    for (const file of files) {
      try {
        appLogger.debug("[FILES] Delete file in folder success " + file);
        fs.unlinkSync(path.join(pathFile, file));
      } catch (err) {
        appLogger.error(
          "[FILES] Cannot delete file ( " + file + ") in folder  " + pathFile,
          {
            sentry: true,
            error,
          }
        );
      }
    }
  });
}
