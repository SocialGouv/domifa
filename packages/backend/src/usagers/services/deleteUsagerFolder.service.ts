import { rm } from "fs-extra";
import { join } from "path";
import { domifaConfig } from "../../config/domifaConfig.service";

import { appLogger } from "../../util";

export async function deleteUsagerFolder({
  usagerRef,
  structureId,
}: {
  usagerRef: number;
  structureId: number;
}): Promise<void> {
  const pathFile = join(
    domifaConfig().upload.basePath,
    `${structureId}`,
    `${usagerRef}`
  );

  try {
    await rm(pathFile, {
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
