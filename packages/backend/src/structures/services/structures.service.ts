import { HttpException, HttpStatus, Injectable } from "@nestjs/common";

import { structureCommonRepository, structureRepository } from "../../database";
import { structureLightRepository } from "../../database/services/structure/structureLightRepository.service";
import {
  Structure,
  StructureCommon,
  StructureLight,
  UserStructure,
} from "../../_common/model";
import { departementHelper } from "../departement-helper.service";
import { StructureEditSmsDto } from "../dto/structure-edit-sms.dto";
import { StructureEditDto } from "../dto/structure-edit.dto";
import { strucutreSmsDateCondition } from "./../../util/structureSms.service";

export interface StructureQuery {
  codePostal?: string;
  verified: boolean;
}

@Injectable()
export class StructuresService {
  public async patch(
    structureDto: StructureEditDto,
    user: Pick<UserStructure, "structureId">
  ): Promise<StructureCommon> {
    structureDto.departement = departementHelper.getDepartementFromCodePostal(
      structureDto.codePostal
    );
    structureDto.region = departementHelper.getRegionCodeFromDepartement(
      structureDto.departement
    );

    return structureCommonRepository.updateOne(
      { id: user.structureId },
      structureDto
    );
  }

  public async patchSmsParams(
    structureSmsDto: StructureEditSmsDto,
    user: Pick<UserStructure, "structureId" | "structure">
  ): Promise<StructureCommon> {
    const structure = await structureCommonRepository.findOne({
      id: user.structureId,
    });
    const date = strucutreSmsDateCondition(structure.sms, structureSmsDto);

    return structureCommonRepository.updateOne(
      { id: user.structureId },
      {
        sms: {
          senderName: structureSmsDto.senderName,
          senderDetails: structureSmsDto.senderName,
          enabledByDomifa: structureSmsDto.enabledByDomifa,
          enabledByStructure: structureSmsDto.enabledByStructure,
          dateActivation: date.dateActivation,
          dateDisabled: date.dateDisabled,
        },
      }
    );
  }

  public async findOneFull(structureId: number): Promise<Structure> {
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

  public async findStructuresInRegion(regionId?: string): Promise<number[]> {
    const structures: Structure[] = await structureRepository.findMany(
      { region: regionId },
      { select: ["id"] }
    );

    return structures.map((structure: Structure) => {
      return structure.id;
    });
  }
}
