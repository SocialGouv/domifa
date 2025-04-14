import {
  appLogsRepository,
  structureRepository,
  usagerDocsRepository,
  usagerHistoryStatesRepository,
  usagerRepository,
} from "../../../database";
import { messageSmsRepository } from "../../../database/services/message-sms";

import { randomBytes } from "crypto";
import { Structure } from "@domifa/common";

export const structureDeletorService = {
  generateDeleteToken,
  deleteStructure,
};

async function generateDeleteToken(uuid: string): Promise<Structure> {
  const token = randomBytes(30).toString("hex");

  await structureRepository.update({ uuid }, { token });
  return structureRepository.findOneBy({ uuid });
}

async function deleteStructure(
  structure: Pick<Structure, "id" | "uuid">
): Promise<any> {
  await resetUsagers(structure);
  return structureRepository.delete({ id: structure.id });
}

export async function resetUsagers(
  structure: Pick<Structure, "id">
): Promise<void> {
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

  await usagerHistoryStatesRepository.delete({
    structureId: structure.id,
  });
}
