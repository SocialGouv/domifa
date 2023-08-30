import { myDataSource } from "./../_postgres/appTypeormManager.service";
import { UsagerDoc } from "./../../../_common/model/usager/UsagerDoc.type";
import { UsagerDocsTable } from "./../../entities/usager/UsagerDocsTable.typeorm";

export const usagerDocsRepository = myDataSource
  .getRepository<UsagerDoc>(UsagerDocsTable)
  .extend({
    async getUsagerDocs(usagerRef: number, structureId: number) {
      return this.find({
        where: {
          usagerRef,
          structureId,
        },
        select: {
          filetype: true,
          label: true,
          uuid: true,
          createdAt: true,
          createdBy: true,
        },
      });
    },
  });
