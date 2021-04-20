import { HttpException, HttpStatus, Injectable } from "@nestjs/common";
import { structureCommonRepository, structureRepository } from "../../database";
import { structureLightRepository } from "../../database/services/structure/structureLightRepository.service";
import {
  AppUser,
  Structure,
  StructureCommon,
  StructureLight,
} from "../../_common/model";
import { departementHelper } from "../departement-helper.service";
import { StructureEditSmsDto } from "../dto/structure-edit-sms.dto";
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

  constructor() {}

  public async patch(
    structureDto: StructureEditDto,
    user: Pick<AppUser, "structureId">
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
    user: Pick<AppUser, "structureId">
  ): Promise<StructureCommon> {
    return structureCommonRepository.updateOne(
      { id: user.structureId },
      {
        sms: {
          enabledByDomifa: true,
          ...structureSmsDto,
        },
      }
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
}
