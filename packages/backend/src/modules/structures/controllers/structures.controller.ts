import {
  Body,
  Controller,
  Get,
  HttpStatus,
  Patch,
  Post,
  Res,
  UseGuards,
} from "@nestjs/common";
import { AuthGuard } from "@nestjs/passport";
import { ApiBearerAuth, ApiTags } from "@nestjs/swagger";
import {
  AllowUserProfiles,
  AllowUserStructureRoles,
  CurrentUser,
} from "../../../auth/decorators";
import {
  appLogsRepository,
  messageSmsRepository,
  structureRepository,
  usagerDocsRepository,
  usagerHistoryStatesRepository,
  usagerRepository,
} from "../../../database";
import { OtpGuard } from "../../otp/guards/otp.guard";
import { RequireOtp } from "../../otp/decorators/require-otp.decorator";
import { ExpressResponse } from "../../../util/express";
import { UserStructureAuthenticated } from "../../../_common/model";
import { StructureDto, StructureEditSmsDto } from "../dto";
import { StructuresService } from "../services/structures.service";
import { AppLogsService } from "../../app-logs/app-logs.service";
import { buildStructureActorFields } from "../../app-logs/app-logs.helpers";

import { AppUserGuard } from "../../../auth/guards";
import {
  ALL_USER_STRUCTURE_ROLES,
  DEPARTEMENTS_MAP,
  getDepartementFromCodePostal,
  getRegionCodeFromDepartement,
  Structure,
} from "@domifa/common";
import { FileManagerService } from "../../../util/file-manager/file-manager.service";
import { domifaConfig } from "../../../config";
import { cleanPath, logDiff } from "../../../util";
import { join } from "path";
import { FindOptionsSelect } from "typeorm";
import { STRUCTURE_DTO_KEYS } from "../constants/STRUCTURE_DTO_KEYS.const";

// Usage
@Controller("structures")
@UseGuards(AuthGuard("jwt"), AppUserGuard)
@ApiTags("structures")
@AllowUserProfiles("structure")
@AllowUserStructureRoles("admin")
@ApiBearerAuth()
export class StructuresController {
  constructor(
    private readonly structureService: StructuresService,
    private readonly appLogsService: AppLogsService,
    private readonly fileManagerService: FileManagerService
  ) {}

  @Patch()
  public async patchStructure(
    @Body() structureDto: StructureDto,
    @CurrentUser() user: UserStructureAuthenticated,
    @Res() res: ExpressResponse
  ) {
    delete structureDto.acceptCgu;

    structureDto.departement = getDepartementFromCodePostal(
      structureDto.codePostal
    );

    structureDto.departmentName =
      DEPARTEMENTS_MAP[structureDto.departement].departmentName;
    structureDto.regionName =
      DEPARTEMENTS_MAP[structureDto.departement].regionName;

    structureDto.region = getRegionCodeFromDepartement(
      structureDto.departement
    );

    structureDto.timeZone = DEPARTEMENTS_MAP[structureDto.departement].timeZone;
    const oldStructure = await structureRepository.findOne({
      where: { id: user.structureId },
      select: STRUCTURE_DTO_KEYS as FindOptionsSelect<Structure>,
    });

    if (!oldStructure) {
      return res
        .status(HttpStatus.BAD_REQUEST)
        .json({ message: "CANNOT_SET_MORE_THAN_2_DAYS_FOR_SMS" });
    }
    const logs = logDiff(oldStructure, structureDto, STRUCTURE_DTO_KEYS);
    try {
      await appLogsRepository.insert({
        ...buildStructureActorFields(user),
        structureId: user.structureId,
        action: "STRUCTURE_UPDATE",
        context: logs,
      });
    } catch (error) {
      console.error("Failed to create audit log:", error);
    }

    await structureRepository.update({ id: user.structureId }, structureDto);

    const updatedStructure = await structureRepository.findOneBy({
      id: user.structureId,
    });
    return res.status(HttpStatus.OK).json(updatedStructure);
  }

  @Patch("sms")
  public async patchSmsParams(
    @Body() structureSmsDto: StructureEditSmsDto,
    @CurrentUser() user: UserStructureAuthenticated,
    @Res() res: ExpressResponse
  ) {
    if (!user.structure.sms.enabledByDomifa) {
      return res
        .status(HttpStatus.BAD_REQUEST)
        .json({ message: "SMS_NOT_ENABLED_BY_DOMIFA" });
    }

    const values = Object.values(structureSmsDto.schedule);
    const checkedDaysCount = values.filter((value) => value === true).length;

    if (checkedDaysCount === 0) {
      return res
        .status(HttpStatus.BAD_REQUEST)
        .json({ message: "MUST_SET_AT_LEAST_1_DAY" });
    }

    if (checkedDaysCount > 2) {
      return res
        .status(HttpStatus.BAD_REQUEST)
        .json({ message: "CANNOT_SET_MORE_THAN_2_DAYS_FOR_SMS" });
    }

    const before = { ...user.structure.sms };

    await this.appLogsService.create({
      ...buildStructureActorFields(user),
      structureId: user.structureId,
      action: "SMS_SETTINGS_UPDATE",
      context: {
        before,
        after: {
          enabledByStructure: structureSmsDto.enabledByStructure,
          schedule: structureSmsDto.schedule,
          senderName: structureSmsDto.senderName,
          senderDetails: structureSmsDto.senderDetails,
        },
      },
    });

    structureSmsDto.enabledByDomifa = user.structure.sms.enabledByDomifa;

    const retour = await this.structureService.patchSmsParams(
      structureSmsDto,
      user
    );

    return res.status(HttpStatus.OK).json(retour);
  }

  @AllowUserStructureRoles(...ALL_USER_STRUCTURE_ROLES)
  @Get("ma-structure")
  public getMyStructure(@CurrentUser() user: UserStructureAuthenticated) {
    return user.structure;
  }

  @ApiBearerAuth()
  @Post("hard-reset-confirm")
  @UseGuards(OtpGuard)
  @RequireOtp("RESET_USAGERS")
  public async hardResetConfirm(
    @Res() res: ExpressResponse,
    @CurrentUser() user: UserStructureAuthenticated
  ) {
    await usagerDocsRepository.delete({ structureId: user.structureId });
    await usagerRepository.delete({ structureId: user.structureId });
    await messageSmsRepository.delete({ structureId: user.structureId });
    await usagerHistoryStatesRepository.delete({
      structureId: user.structureId,
    });

    const key = `${join(
      domifaConfig().upload.bucketRootDir,
      "usager-documents",
      cleanPath(user.structure.uuid)
    )}/`;

    await this.fileManagerService.deleteAllUnderStructure(key);

    return res.status(HttpStatus.OK).json({ message: "success" });
  }
}
