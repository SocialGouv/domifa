import * as fs from "fs";
import * as path from "path";
import { domifaConfig } from "../../config/domifaConfig.service";

import { appLogger } from "../../util";

export async function deleteUsagerFolder({
  usagerRef,
  structureId,
}: {
  usagerRef: number;
  structureId: number;
}): Promise<void> {
  console.log(
    path.join(domifaConfig().upload.basePath, `${structureId}`, `${usagerRef}`)
  );
  const pathFile = path.resolve(
    path.join(domifaConfig().upload.basePath, `${structureId}`, `${usagerRef}`)
  );
  console.log(pathFile);

  if (!fs.existsSync(pathFile)) {
    appLogger.debug(
      "Nothing to delete, folder not exists - pathFile : " + pathFile
    );
    return;
  }

  try {
    await fs.promises.rm(pathFile, {
      recursive: true,
      force: true,
      maxRetries: 2,
    });
    appLogger.debug("[FILES] Delete file in folder success " + pathFile);
  } catch (error) {
    appLogger.error("[FILES] Cannot delete folder  " + pathFile, {
      sentry: true,
      error,
    });
  }
}
