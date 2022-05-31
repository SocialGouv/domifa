import { UsagerLight } from "./../../_common/model/usager/UsagerLight.type";
import { Injectable } from "@nestjs/common";
import { usagerRepository } from "../../database";
import { Usager } from "../../_common/model";

@Injectable()
export class DocumentsService {
  public async deleteDocument(
    usager: UsagerLight,
    index: number
  ): Promise<Usager> {
    const newDocs = usager.docs;
    const newDocsPath = usager.docsPath;

    newDocs.splice(index, 1);
    newDocsPath.splice(index, 1);

    return await usagerRepository.updateOne(
      { uuid: usager.uuid },
      {
        docs: usager.docs,
        docsPath: usager.docsPath,
      }
    );
  }
}
