import { Injectable } from "@nestjs/common";

import { DeleteResult, Repository } from "typeorm";
import { appTypeormManager } from "../../database";
import { StructureDocTable } from "../../database/entities/structure-doc";
import { StructureDoc } from "../../_common/model/structure-doc";

@Injectable()
export class StructureDocService {
  private structureDocRepository: Repository<StructureDocTable>;

  constructor() {
    this.structureDocRepository =
      appTypeormManager.getRepository(StructureDocTable);
  }

  public async create(structureDoc: StructureDoc): Promise<any> {
    return this.structureDocRepository.insert(structureDoc);
  }

  public async findAll(structureId: number): Promise<StructureDoc[]> {
    return this.structureDocRepository.findBy({
      structureId,
    });
  }

  public async findOne(
    structureId: number,
    uuid: string
  ): Promise<StructureDoc> {
    return this.structureDocRepository.findOneBy({
      structureId,
      uuid,
    });
  }

  public async deleteOne(
    structureId: number,
    uuid: string
  ): Promise<DeleteResult> {
    return this.structureDocRepository.delete({
      structureId,
      uuid,
    });
  }
}
