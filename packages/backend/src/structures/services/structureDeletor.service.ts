import { StructureLight } from "./../../_common/model/structure/StructureLight.type";

import { domifaConfig } from "../../config";
import {
  appLogsRepository,
  structureRepository,
  usagerDocsRepository,
  usagerRepository,
} from "../../database";
import { messageSmsRepository } from "../../database/services/message-sms";
import { appLogger } from "../../util";
import { Structure } from "../../_common/model";
import { randomBytes } from "crypto";
import { rm } from "fs-extra";
import { join } from "path";

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

async function deleteStructureUsagers({
  structureId,
}: {
  structureId: number;
}) {
  await deleteStructureDocuments(structureId);

  await resetUsagers(structureId);
}

async function deleteStructure(structure: StructureLight): Promise<any> {
  await deleteStructureUsagers({
    structureId: structure.id,
  });

  return structureRepository.delete({ id: structure.id });
}

async function resetUsagers(structureId: number): Promise<void> {
  // Suppression des Documents
  await usagerDocsRepository.delete({
    structureId,
  });

  await usagerRepository.deleteByCriteria({
    structureId,
  });

  await appLogsRepository.delete({
    structureId,
  });

  await messageSmsRepository.delete({
    structureId,
  });
}

async function deleteStructureDocuments(structureId: number) {
  const pathFile = join(domifaConfig().upload.basePath, `${structureId}`);

  try {
    await rm(pathFile, {
      recursive: true,
      force: true,
      maxRetries: 2,
    });
    appLogger.debug(
      "[deleteStructure] Delete structure folder success " + pathFile
    );
  } catch (error) {
    appLogger.error(
      "[deleteStructure] Cannot delete structure folder  " + pathFile,
      {
        sentry: true,
        error,
      }
    );
  }
}
