import { UsagerDoc } from "./../../../_common/model/usager/UsagerDoc.type";
import { UsagerDocsTable } from "./../../entities/usager/UsagerDocsTable.typeorm";

import { pgRepository } from "../_postgres/pgRepository.service";

const baseRepository = pgRepository.get<UsagerDocsTable, UsagerDoc>(
  UsagerDocsTable
);

export const usagerDocsRepository = {
  ...baseRepository,
  getUsagerDocs,
};

async function getUsagerDocs(usagerRef: number, structureId: number) {
  return usagerDocsRepository.findMany(
    {
      usagerRef,
      structureId,
    },
    {
      select: ["filetype", "label", "uuid", "createdAt", "createdBy"],
    }
  );
}
