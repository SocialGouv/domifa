import { HttpException, HttpStatus } from "@nestjs/common";
import * as crypto from "crypto";
import * as fs from "fs";
import * as path from "path";
import { domifaConfig } from "../../config";
import {
  interactionRepository,
  structureDocRepository,
  structureRepository,
  usagerHistoryRepository,
  usagerRepository,
  userStructureRepository,
  userStructureSecurityRepository,
} from "../../database";
import { messageSmsRepository } from "../../database/services/message-sms";

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
  await interactionRepository.deleteByCriteria({
    structureId,
  });

  await usagerHistoryRepository.deleteByCriteria({
    structureId,
  });

  await messageSmsRepository.deleteByCriteria({
    structureId,
  });

  await usagerRepository.deleteByCriteria({
    structureId,
  });
}

async function deleteStructure({
  structureId,
  token,
  structureNom,
}: {
  structureId: number;
  token: string;
  structureNom: string;
}) {
  const structure = await structureRepository.findOne({
    token,
    nom: structureNom,
    id: structureId,
  });

  if (!!structure) {
    await userStructureSecurityRepository.deleteByCriteria({
      structureId: structure.id,
    });

    await userStructureRepository.deleteByCriteria({
      structureId: structure.id,
    });

    await deleteStructureUsagers({
      structureId: structure.id,
    });

    await structureDocRepository.deleteByCriteria({ structureId });

    await structureRepository.deleteByCriteria({ id: structureId });

    const pathFile = path.join(
      domifaConfig().upload.basePath,
      `${structure.id}`
    );

    if (fs.existsSync(pathFile)) {
      fs.rmdirSync(pathFile, { recursive: true });
    }
  } else {
    throw new HttpException(
      "DELETED_STRUCTURE_CONFIRM_IMPOSSIBLE",
      HttpStatus.BAD_REQUEST
    );
  }
}
