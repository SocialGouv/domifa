import { HttpException, HttpStatus, Injectable } from "@nestjs/common";
import { structureCommonRepository, structureRepository } from "../../database";
import { structureLightRepository } from "../../database/services/structure/structureLightRepository.service";
import {
  AppUser,
  StructureCommon,
  StructureLight,
  StructurePG,
} from "../../_common/model";
import { DepartementHelper } from "../departement-helper.service";
import { StructureEditDto } from "../dto/structure-edit.dto";
import moment = require("moment");

export interface StructureQuery {
  codePostal?: string;
  verified: boolean;
}

@Injectable()
export class StructuresService {
  public labels = {
    asso: "Organisme agrée",
    ccas: "CCAS",
    cias: "CIAS ou commune",
  };

  constructor(private departementHelper: DepartementHelper) {}

  public async patch(
    structureDto: StructureEditDto,
    user: Pick<AppUser, "structureId">
  ): Promise<StructureCommon> {
    structureDto.departement = this.departementHelper.getDepartementFromCodePostal(
      structureDto.codePostal
    );
    structureDto.region = this.departementHelper.getRegionCodeFromDepartement(
      structureDto.departement
    );

    return structureCommonRepository.updateOne(
      { id: user.structureId },
      structureDto
    );
  }

  public async updateLastExport(
    structureId: number,
    dateExport: Date
  ): Promise<StructureCommon> {
    return structureCommonRepository.updateOne(
      { id: structureId },
      { lastExport: dateExport }
    );
  }

  public async updateStructureStats(
    structureId: number,
    valide: number,
    refus: number,
    radie: number
  ): Promise<StructureCommon> {
    const total = valide + refus + radie;
    return structureCommonRepository.updateOne(
      { id: structureId },
      {
        stats: { TOTAL: total, VALIDE: valide, REFUS: refus, RADIE: radie },
      }
    );
  }

  public async updateLastLogin(structureId: number): Promise<StructureCommon> {
    return structureCommonRepository.updateOne(
      { id: structureId },
      { lastLogin: new Date() }
    );
  }

  public async findOneFull(structureId: number): Promise<StructurePG> {
    const structure = await structureRepository.findOne({
      id: structureId,
    });
    if (!structure || structure === null) {
      throw new HttpException("NOT_EXIST", HttpStatus.BAD_REQUEST);
    }
    return structure;
  }
  public async findOne(structureId: number): Promise<StructureCommon> {
    const structure = await structureCommonRepository.findOne({
      id: structureId,
    });
    if (!structure || structure === null) {
      throw new HttpException("NOT_EXIST", HttpStatus.BAD_REQUEST);
    }
    return structure;
  }

  public async findOneLight(param: any): Promise<StructureLight> {
    const structure = await structureLightRepository.findOne(param);
    return structure;
  }

  public async findManyLight(param: any): Promise<StructureLight[]> {
    const structure = await structureLightRepository.findMany(param);

    return structure;
  }

  public async findAllLight(codePostal?: string): Promise<StructureLight[]> {
    const params: StructureQuery = {
      verified: true,
    };

    if (codePostal) {
      params.codePostal = codePostal;
    }

    return structureLightRepository.findMany(params, {
      maxResults: 100,
    });
  }

  public async importSuccess(id: number): Promise<StructureCommon> {
    return structureCommonRepository.updateOne(
      { id },
      { import: true, importDate: new Date() }
    );
  }
}
