import { Injectable } from "@nestjs/common";
import { usagerRepository } from "../../database";
import { AppUser, Usager } from "../../_common/model";

@Injectable()
export class DocumentsService {
  constructor() {}

  public async deleteDocument(
    usagerRef: number,
    index: number,
    user: Pick<AppUser, "structureId">
  ): Promise<Usager> {
    const usager = await usagerRepository.findOne({
      ref: usagerRef,
      structureId: user.structureId,
    });
    const newDocs = usager.docs;
    const newDocsPath = usager.docsPath;

    newDocs.splice(index, 1);
    newDocsPath.splice(index, 1);

    return usagerRepository.updateOne(
      { ref: usagerRef, structureId: user.structureId },
      {
        docs: usager.docs,
        docsPath: usager.docsPath,
      }
    );
  }
}
