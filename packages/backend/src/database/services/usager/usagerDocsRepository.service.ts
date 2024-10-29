import { UsagerDoc } from "@domifa/common";
import { UsagerDocsTable } from "../../entities";
import { myDataSource } from "../_postgres";

export const USAGER_DOCS_FIELDS_TO_SELECT = {
  filetype: true,
  label: true,
  uuid: true,
  createdAt: true,
  createdBy: true,
  shared: true,
};

export const usagerDocsRepository = myDataSource
  .getRepository<UsagerDoc>(UsagerDocsTable)
  .extend({
    async getUsagerDocs(usagerRef: number, structureId: number) {
      return await this.find({
        where: {
          usagerRef,
          structureId,
        },
        select: USAGER_DOCS_FIELDS_TO_SELECT,
        order: {
          createdAt: "DESC",
        },
      });
    },
  });
