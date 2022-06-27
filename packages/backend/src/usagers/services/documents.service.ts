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

    newDocs.splice(index, 1);
    // TODO: mettre à jour après migration
    return await usagerRepository.updateOne(
      { uuid: usager.uuid },
      {
        docs: usager.docs,
      }
    );
  }
}
