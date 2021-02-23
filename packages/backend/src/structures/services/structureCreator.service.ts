import { HttpException, HttpStatus, Injectable } from "@nestjs/common";
import * as crypto from "crypto";
import {
  structureCommonRepository,
  structureRepository,
  StructureTable,
  usersRepository,
} from "../../database";
import { newStructureEmailSender } from "../../mails/services/templates-renderers";
import {
  buildStatsDateUTC,
  StatsGeneratorService,
} from "../../stats/services/stats-generator.service";
import { UserDto } from "../../users/dto/user.dto";
import { UsersService } from "../../users/services/users.service";
import { appLogger } from "../../util/AppLogger.service";
import { StructureCommon } from "../../_common/model";
import { DepartementHelper } from "../departement-helper.service";
import { StructureDto } from "../dto/structure.dto";
import moment = require("moment");

@Injectable()
export class StructureCreatorService {
  constructor(
    private departementHelper: DepartementHelper,
    private statsGeneratorService: StatsGeneratorService,
    private usersService: UsersService
  ) {}

  public async checkStructureCreateArgs(
    structureDto: StructureDto
  ): Promise<StructureDto> {
    try {
      const departement = this.departementHelper.getDepartementFromCodePostal(
        structureDto.codePostal
      );
      this.departementHelper.getRegionCodeFromDepartement(departement);
    } catch (err) {
      appLogger.warn(
        `[StructuresService] error validating postal code "${structureDto.codePostal}"`
      );
      throw new HttpException("REGION_PROBLEM", HttpStatus.BAD_REQUEST);
    }

    return structureDto;
  }

  public async createStructureWithAdminUser(
    structureDto: StructureDto,
    userDto: UserDto
  ): Promise<{ structureId: number; userId: number }> {
    const existingUser = await usersRepository.findOne({
      email: userDto.email,
    });

    if (!!existingUser) {
      throw new HttpException("EMAIL_EXIST", HttpStatus.BAD_REQUEST);
    }

    const structure = await this.createStructure(structureDto);

    // generate stats for yesterday
    const statsDateUTC = buildStatsDateUTC({ date: "yesterday" });

    await this.statsGeneratorService.generateStructureStats(
      statsDateUTC,
      structure,
      true
    );

    const user = await this.usersService.create(userDto, {
      structure,
      role: "admin",
    });

    if (!user || !structure) {
      throw new HttpException(
        "STRUCTURE_OR_USER_NOT_FOUND",
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }

    delete user.password;

    await newStructureEmailSender.sendMail({ structure, user });

    return { structureId: structure.id, userId: user.id };
  }

  public async checkCreationToken({
    structureId,
    token,
  }: {
    structureId: number;
    token: string;
  }): Promise<StructureCommon> {
    return structureCommonRepository.updateOne(
      { id: structureId, token },
      { token: "", verified: true },
      { returnSearch: { id: structureId } }
    );
  }

  private async createStructure(structureDto: StructureDto) {
    const createdStructure = new StructureTable(structureDto);
    createdStructure.registrationDate = new Date();
    createdStructure.token = crypto.randomBytes(30).toString("hex");

    createdStructure.departement = this.departementHelper.getDepartementFromCodePostal(
      createdStructure.codePostal
    );
    createdStructure.region = this.departementHelper.getRegionCodeFromDepartement(
      createdStructure.departement
    );
    createdStructure.stats = {
      RADIE: 0,
      REFUS: 0,
      TOTAL: 0,
      VALIDE: 0,
    };

    const structure = await structureRepository.save(createdStructure);

    return structure;
  }
}
