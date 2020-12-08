import { HttpException, HttpStatus, Inject, Injectable } from "@nestjs/common";

import { DeleteResult, Repository } from "typeorm";
import { appTypeormManager } from "../../database";
import { StructureDocTable } from "../../database/entities/structure-doc";
import { StructureDoc } from "../../_common/model/structure-doc";

export interface StructureQuery {
  codePostal?: string;
  verified: boolean;
}

@Injectable()
export class StructureDocService {
  private structureDocRepository: Repository<StructureDocTable>;

  constructor() {
    this.structureDocRepository = appTypeormManager.getRepository(
      StructureDocTable
    );
  }

  public async create(structureDoc: StructureDoc): Promise<any> {
    return this.structureDocRepository.insert(structureDoc);
  }

  public async findAll(structureId: number): Promise<StructureDoc[]> {
    return this.structureDocRepository.find({
      structureId,
    });
  }

  public async findOne(
    structureId: number,
    structureDocId: number
  ): Promise<StructureDoc> {
    return this.structureDocRepository.findOne({
      structureId,
      id: structureDocId,
    });
  }

  public async deleteOne(
    structureId: number,
    structureDocId: number
  ): Promise<DeleteResult> {
    return this.structureDocRepository.delete({
      structureId,
      id: structureDocId,
    });
  }

  public async patch(): Promise<any> {}
}
