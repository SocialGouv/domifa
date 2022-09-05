import { HttpException, HttpStatus, Injectable } from "@nestjs/common";

import { structureCommonRepository, structureRepository } from "../../database";
import { structureLightRepository } from "../../database/services/structure/structureLightRepository.service";
import {
  Structure,
  StructureCommon,
  StructureLight,
  UserStructure,
} from "../../_common/model";
import { departementHelper } from "./departement-helper.service";
import { StructureEditSmsDto } from "../dto/structure-edit-sms.dto";
import { StructureDto } from "../dto";
import { DEPARTEMENTS_MAP } from "../../util/territoires";

export interface StructureQuery {
  codePostal?: string;
  verified: boolean;
}

@Injectable()
export class StructuresService {
  public async patch(
    structureDto: StructureDto,
    user: Pick<UserStructure, "structureId">
  ): Promise<StructureCommon> {
    structureDto.departement = departementHelper.getDepartementFromCodePostal(
      structureDto.codePostal
    );

    structureDto.region = departementHelper.getRegionCodeFromDepartement(
      structureDto.departement
    );

    structureDto.timeZone = DEPARTEMENTS_MAP[structureDto.departement].timeZone;

    return structureCommonRepository.updateOne(
      { id: user.structureId },
      structureDto
    );
  }

  public async patchSmsParams(
    structureSmsDto: StructureEditSmsDto,
    user: Pick<UserStructure, "structureId" | "structure">
  ): Promise<StructureCommon> {
    return structureCommonRepository.updateOne(
      { id: user.structureId },
      { sms: structureSmsDto }
    );
  }

  public async findOneFull(structureId: number): Promise<Structure> {
    const structure = await structureRepository.findOneBy({
      id: structureId,
    });

    if (!structure) {
      throw new HttpException("STRUCTURE_NOT_EXIST", HttpStatus.BAD_REQUEST);
    }
    return structure;
  }

  public async findOne(structureId: number): Promise<StructureCommon> {
    const structure = await structureCommonRepository.findOne({
      id: structureId,
    });
    if (!structure) {
      throw new HttpException("STRUCTURE_NOT_EXIST", HttpStatus.BAD_REQUEST);
    }
    return structure;
  }

  public async findAllLight(codePostal?: string): Promise<StructureLight[]> {
    const params: StructureQuery = {
      verified: true,
    };

    if (codePostal) {
      params.codePostal = codePostal;
    }

    return structureLightRepository.find({ where: params, take: 100 });
  }

  public async findStructuresInRegion(regionId?: string): Promise<number[]> {
    const structures: Structure[] = await structureRepository.find({
      where: { region: regionId },
      select: { id: true },
    });

    return structures.map((structure: Structure) => {
      return structure.id;
    });
  }
}
