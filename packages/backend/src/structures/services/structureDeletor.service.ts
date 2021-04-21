import { HttpException, HttpStatus } from "@nestjs/common";
import * as crypto from "crypto";
import * as fs from "fs";
import { domifaConfig } from "../../config";
import {
  interactionRepository,
  structureDocRepository,
  structureRepository,
  structureStatsRepository,
  usagerRepository,
  userSecurityRepository,
  usersRepository,
} from "../../database";

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
  await structureStatsRepository.deleteByCriteria({
    structureId,
  });
  await interactionRepository.deleteByCriteria({
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
    await userSecurityRepository.deleteByCriteria({
      structureId: structure.id,
    });
    await usersRepository.deleteByCriteria({
      structureId: structure.id,
    });
    await deleteStructureUsagers({
      structureId: structure.id,
    });
    await structureDocRepository.deleteByCriteria({ structureId });
    await structureRepository.deleteByCriteria({ id: structureId });

    const pathFile = domifaConfig().upload.basePath + structure.id;
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
