import { StructureLight } from "../../_common/model/structure/StructureLight.type";

import { domifaConfig } from "../../config";
import {
  appLogsRepository,
  structureRepository,
  usagerDocsRepository,
  usagerRepository,
} from "../../database";
import { messageSmsRepository } from "../../database/services/message-sms";
import { Structure } from "../../_common/model";
import { randomBytes } from "crypto";
import { rm } from "fs-extra";
import { join } from "path";
import { cleanPath } from "../../util";

export const structureDeletorService = {
  generateDeleteToken,
  deleteStructureUsagers,
  deleteStructure,
};

async function generateDeleteToken(uuid: string): Promise<Structure> {
  const token = randomBytes(30).toString("hex");

  await structureRepository.update({ uuid }, { token });
  return structureRepository.findOneBy({ uuid });
}

async function deleteStructureUsagers(structure: StructureLight) {
  await deleteStructureDocuments(structure);

  await resetUsagers(structure);
}

async function deleteStructure(structure: StructureLight): Promise<any> {
  await deleteStructureUsagers(structure);

  return structureRepository.delete({ id: structure.id });
}

async function resetUsagers(structure: StructureLight): Promise<void> {
  // Suppression des Documents
  await usagerDocsRepository.delete({
    structureId: structure.id,
  });

  await usagerRepository.delete({
    structureId: structure.id,
  });

  await appLogsRepository.delete({
    structureId: structure.id,
  });

  await messageSmsRepository.delete({
    structureId: structure.id,
  });
}

async function deleteStructureDocuments(structure: StructureLight) {
  const oldUsagerFolder = join(
    domifaConfig().upload.basePath,
    `${structure.id}`
  );
  await rm(oldUsagerFolder, {
    recursive: true,
    force: true,
    maxRetries: 2,
  });

  const newUsagerFolder = join(
    domifaConfig().upload.basePath,
    "usager-documents",
    cleanPath(structure.uuid)
  );

  await rm(newUsagerFolder, {
    recursive: true,
    force: true,
    maxRetries: 2,
  });
}
