import { HttpException, HttpStatus, Injectable } from "@nestjs/common";

import { structureRepository } from "../../database";
import { Structure, StructureLight, UserStructure } from "../../_common/model";
import { StructureEditSmsDto } from "../dto/structure-edit-sms.dto";
import { CodePostalDto } from "../dto";
import { FranceRegion } from "../../util/territoires";

@Injectable()
export class StructuresService {
  public async patchSmsParams(
    structureSmsDto: StructureEditSmsDto,
    user: Pick<UserStructure, "structureId" | "structure">
  ): Promise<void> {
    await structureRepository.update(
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

  public async findAllLight(dto: CodePostalDto): Promise<StructureLight[]> {
    return structureRepository.find({
      where: {
        verified: true,
        codePostal: dto.codePostal,
      },
      select: {
        nom: true,
        adresse: true,
        codePostal: true,
        ville: true,
      },
      take: 40,
    });
  }

  public async findStructuresInRegion(
    regionId?: FranceRegion
  ): Promise<number[]> {
    const structures: Structure[] = await structureRepository.find({
      where: { region: regionId },
      select: { id: true },
    });

    return structures.map((structure: Structure) => structure.id);
  }
}
