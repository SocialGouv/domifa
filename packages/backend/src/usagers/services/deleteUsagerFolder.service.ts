import { rm } from "fs-extra";
import { join } from "path";
import { domifaConfig } from "../../config/domifaConfig.service";

import { Usager } from "../../_common/model";
import { cleanPath } from "../../util";
import { StructureCommon } from "@domifa/common";

export async function deleteUsagerFolder(
  structure: StructureCommon,
  usager: Usager
): Promise<void> {
  const oldUsagerFolder = join(
    domifaConfig().upload.basePath,
    `${usager.structureId}`,
    `${usager.ref}`
  );

  const newUsagerFolder = join(
    domifaConfig().upload.basePath,
    "usager-documents",
    cleanPath(structure.uuid),
    cleanPath(usager.uuid)
  );

  await rm(oldUsagerFolder, {
    recursive: true,
    force: true,
    maxRetries: 2,
  });

  await rm(newUsagerFolder, {
    recursive: true,
    force: true,
    maxRetries: 2,
  });
}
