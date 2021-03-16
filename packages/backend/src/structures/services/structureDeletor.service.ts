import { HttpException, HttpStatus, Injectable } from "@nestjs/common";
import * as crypto from "crypto";
import * as fs from "fs";
import { domifaConfig } from "../../config";
import {
  structureDocRepository,
  structureRepository,
  structureStatsRepository,
  usagerRepository,
  userSecurityRepository,
  usersRepository,
} from "../../database";
import { InteractionsService } from "../../interactions/interactions.service";
import { UsagersService } from "../../usagers/services/usagers.service";

@Injectable()
export class StructureDeletorService {
  constructor(
    private usagersService: UsagersService,
    private interactionsService: InteractionsService
  ) {}

  public async generateDeleteToken(id: number) {
    const token = crypto.randomBytes(30).toString("hex");
    return structureRepository.updateOne({ id: id }, { token });
  }

  public async deleteOne({
    structureId,
    token,
    structureNom,
  }: {
    structureId: number;
    token: string;
    structureNom: string;
  }) {
    const structure = await structureRepository.findOne({
      token,
      nom: structureNom,
      id: structureId,
    });

    if (!!structure) {
      await userSecurityRepository.deleteByCriteria({
        structureId: structure.id,
      });
      await usersRepository.deleteByCriteria({
        structureId: structure.id,
      });
      await usagerRepository.deleteByCriteria({
        structureId: structure.id,
      });
      await this.interactionsService.deleteAll(structure.id);
      await structureStatsRepository.deleteByCriteria({ structureId });
      await structureDocRepository.deleteByCriteria({ structureId });
      await structureRepository.deleteByCriteria({ id: structureId });

      const pathFile = domifaConfig().upload.basePath + structure.id;
      if (fs.existsSync(pathFile)) {
        fs.rmdirSync(pathFile, { recursive: true });
      }
    } else {
      throw new HttpException(
        "DELETED_STRUCTURE_CONFIRM_IMPOSSIBLE",
        HttpStatus.BAD_REQUEST
      );
    }
  }
}
