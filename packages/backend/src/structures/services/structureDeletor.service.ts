import { StructureLight } from "./../../_common/model/structure/StructureLight.type";
import { usagerOptionsHistoryRepository } from "./../../database/services/usager/usagerOptionsHistoryRepository.service";
import * as crypto from "crypto";
import * as fs from "fs";
import * as path from "path";
import { domifaConfig } from "../../config";
import {
  appLogsRepository,
  interactionRepository,
  structureDocRepository,
  structureRepository,
  usagerDocsRepository,
  usagerHistoryRepository,
  usagerRepository,
  userStructureRepository,
  userUsagerRepository,
  userUsagerSecurityRepository,
} from "../../database";
import { messageSmsRepository } from "../../database/services/message-sms";
import { appLogger } from "../../util";
import { Structure } from "../../_common/model";

export const structureDeletorService = {
  generateDeleteToken,
  deleteStructureUsagers,
  deleteStructure,
};

async function generateDeleteToken(id: number): Promise<Structure> {
  const token = crypto.randomBytes(30).toString("hex");
  return structureRepository.updateOne({ id }, { token });
}

async function deleteStructureUsagers({
  structureId,
}: {
  structureId: number;
}) {
  await deleteStructureDocuments(structureId);

  await resetUsagers(structureId);
}

async function deleteStructure(structure: StructureLight): Promise<number> {
  await deleteStructureUsagers({
    structureId: structure.id,
  });

  await userStructureRepository.deleteByCriteria({
    structureId: structure.id,
  });

  await structureDocRepository.deleteByCriteria({ structureId: structure.id });

  return structureRepository.deleteByCriteria({ id: structure.id });
}

async function resetUsagers(structureId: number): Promise<void> {
  // Suppression des comptes usagers
  await userUsagerSecurityRepository.deleteByCriteria({
    structureId,
  });

  await userUsagerRepository.deleteByCriteria({
    structureId,
  });

  await appLogsRepository.deleteByCriteria({
    structureId,
  });

  // Suppression des interactions
  await interactionRepository.deleteByCriteria({
    structureId,
  });

  await usagerHistoryRepository.deleteByCriteria({
    structureId,
  });

  await usagerOptionsHistoryRepository.deleteByCriteria({
    structureId,
  });

  await messageSmsRepository.deleteByCriteria({
    structureId,
  });

  await usagerDocsRepository.deleteByCriteria({
    structureId,
  });

  await usagerRepository.deleteByCriteria({
    structureId,
  });
}

async function deleteStructureDocuments(structureId: number) {
  const pathFile = path.join(domifaConfig().upload.basePath, `${structureId}`);

  try {
    await fs.promises.rm(pathFile, {
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
