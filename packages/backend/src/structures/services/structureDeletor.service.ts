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
  usagerHistoryRepository,
  usagerRepository,
  userStructureRepository,
  userStructureSecurityRepository,
  userUsagerRepository,
  userUsagerSecurityRepository,
} from "../../database";
import { messageSmsRepository } from "../../database/services/message-sms";
import { appLogger } from "../../util";

export const structureDeletorService = {
  generateDeleteToken,
  deleteStructureUsagers,
  deleteStructure,
};

async function generateDeleteToken(id: number) {
  const token = crypto.randomBytes(30).toString("hex");
  return structureRepository.updateOne({ id }, { token });
}

async function deleteStructureUsagers({
  structureId,
}: {
  structureId: number;
}) {
  await deleteStructureDocuments(structureId);
  // Suppression des comptes usagers
  await userUsagerSecurityRepository.deleteByCriteria({
    structureId,
  });

  await appLogsRepository.deleteByCriteria({
    structureId,
  });

  await userUsagerRepository.deleteByCriteria({
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

  await usagerRepository.deleteByCriteria({
    structureId,
  });
}

async function deleteStructure(structure: StructureLight) {
  await deleteStructureDocuments(structure.id);
  // Suppression des comptes usagers
  await userUsagerSecurityRepository.deleteByCriteria({
    structureId: structure.id,
  });

  await appLogsRepository.deleteByCriteria({
    structureId: structure.id,
  });

  await userUsagerRepository.deleteByCriteria({
    structureId: structure.id,
  });

  // Suppression des interactions
  await interactionRepository.deleteByCriteria({
    structureId: structure.id,
  });

  await usagerHistoryRepository.deleteByCriteria({
    structureId: structure.id,
  });

  await usagerOptionsHistoryRepository.deleteByCriteria({
    structureId: structure.id,
  });

  await messageSmsRepository.deleteByCriteria({
    structureId: structure.id,
  });

  await usagerRepository.deleteByCriteria({
    structureId: structure.id,
  });

  await userStructureSecurityRepository.deleteByCriteria({
    structureId: structure.id,
  });

  await userStructureRepository.deleteByCriteria({
    structureId: structure.id,
  });

  await deleteStructureUsagers({
    structureId: structure.id,
  });

  await structureDocRepository.deleteByCriteria({ structureId: structure.id });

  return structureRepository.deleteByCriteria({ id: structure.id });
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
