import { Inject, Injectable } from "@nestjs/common";
import { Model } from "mongoose";

import { User } from "../../users/user.interface";
import { Usager } from "../interfaces/usagers";

@Injectable()
export class DocumentsService {
  constructor(
    @Inject("USAGER_MODEL") private readonly usagerModel: typeof Model
  ) {}

  public async deleteDocument(
    usagerId: number,
    index: number,
    user: User
  ): Promise<Usager> {
    const usager = await this.usagerModel
      .findOne({ id: usagerId, structureId: user.structureId })
      .exec();
    const newDocs = usager.docs;
    const newDocsPath = usager.docsPath;
    newDocs.splice(index, 1);
    newDocsPath.splice(index, 1);

    /* GET USER NAME ID */
    return this.usagerModel
      .findOneAndUpdate(
        { id: usagerId, structureId: user.structureId },
        {
          $set: {
            docs: usager.docs,
            docsPath: usager.docsPath,
          },
        },
        {
          new: true,
        }
      )
      .exec();
  }
}
