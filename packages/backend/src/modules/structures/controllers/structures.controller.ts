import {
  Body,
  Controller,
  Get,
  HttpStatus,
  Param,
  Patch,
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
import { structureRepository } from "../../../database";
import { ExpressResponse } from "../../../util/express";
import {
  UserStructureAuthenticated,
  USER_STRUCTURE_ROLE_ALL,
} from "../../../_common/model";
import { StructureDto } from "../dto";
import { StructureEditSmsDto } from "../dto/structure-edit-sms.dto";

import { resetUsagers } from "../services/structure-deletor.service";
import { StructureHardResetService } from "../services/structureHardReset.service";
import { StructuresService } from "../services/structures.service";
import { AppLogsService } from "../../app-logs/app-logs.service";

import { ParseHardResetTokenPipe } from "../../../_common/decorators";

import { faker } from "@faker-js/faker";
import { AppUserGuard } from "../../../auth/guards";
import {
  DEPARTEMENTS_MAP,
  getDepartementFromCodePostal,
  getRegionCodeFromDepartement,
} from "@domifa/common";
import { FileManagerService } from "../../../util/file-manager/file-manager.service";
import { domifaConfig } from "../../../config";
import { cleanPath } from "../../../util";
import { join } from "path";
import { hardResetEmailSender } from "../../mails/services/templates-renderers";

@Controller("structures")
@UseGuards(AuthGuard("jwt"), AppUserGuard)
@ApiTags("structures")
@AllowUserProfiles("structure")
@AllowUserStructureRoles("admin")
@ApiBearerAuth()
export class StructuresController {
  constructor(
    private readonly structureHardResetService: StructureHardResetService,
    private readonly structureService: StructuresService,
    private readonly appLogsService: AppLogsService,
    private readonly fileManagerService: FileManagerService
  ) {}

  @Patch()
  public async patchStructure(
    @Body() structureDto: StructureDto,
    @CurrentUser() user: UserStructureAuthenticated
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
    await structureRepository.update({ id: user.structureId }, structureDto);

    return structureRepository.findOneBy({ id: user.structureId });
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
    if (checkedDaysCount > 2) {
      return res
        .status(HttpStatus.BAD_REQUEST)
        .json({ message: "CANNOT_SET_MORE_THAN_2_DAYS_FOR_SMS" });
    }

    if (
      user.structure.sms.enabledByStructure !==
      structureSmsDto.enabledByStructure
    ) {
      const action = structureSmsDto.enabledByStructure
        ? "ENABLE_SMS_BY_STRUCTURE"
        : "DISABLE_SMS_BY_STRUCTURE";

      await this.appLogsService.create({
        userId: user._userId,
        usagerRef: null,
        structureId: user.structureId,
        action,
      });
    }

    structureSmsDto.enabledByDomifa = user.structure.sms.enabledByDomifa;

    const retour = await this.structureService.patchSmsParams(
      structureSmsDto,
      user
    );

    return res.status(HttpStatus.OK).json(retour);
  }

  @AllowUserStructureRoles(...USER_STRUCTURE_ROLE_ALL)
  @Get("ma-structure")
  public getMyStructure(@CurrentUser() user: UserStructureAuthenticated) {
    return user.structure;
  }

  @ApiBearerAuth()
  @Get("hard-reset")
  public async hardReset(
    @Res() res: ExpressResponse,
    @CurrentUser() user: UserStructureAuthenticated
  ) {
    const expireAt = new Date();
    expireAt.setDate(expireAt.getDate() + 1);

    const token = faker.string.alphanumeric(7).toUpperCase();

    const hardResetToken = { token, expireAt, userId: user.id };
    const structure = await this.structureHardResetService.hardReset(
      user.structureId,
      hardResetToken
    );

    if (structure) {
      await hardResetEmailSender.sendMail({
        user,
        confirmationCode: hardResetToken.token,
      });
      return res.status(HttpStatus.OK).json({ message: expireAt });
    } else {
      return res
        .status(HttpStatus.INTERNAL_SERVER_ERROR)
        .json({ message: "HARD_RESET_ERROR" });
    }
  }

  @ApiBearerAuth()
  @Get("hard-reset-confirm/:token")
  public async hardResetConfirm(
    @Res() res: ExpressResponse,
    @CurrentUser() user: UserStructureAuthenticated,
    @Param("token", new ParseHardResetTokenPipe()) token: string
  ) {
    const structure = await structureRepository.checkHardResetToken({
      userId: user.id,
      token,
    });

    if (!structure) {
      return res
        .status(HttpStatus.INTERNAL_SERVER_ERROR)
        .json({ message: "HARD_RESET_INCORRECT_TOKEN" });
    }

    const now = new Date();

    if (structure.hardReset.expireAt && structure.hardReset.expireAt < now) {
      return res
        .status(HttpStatus.INTERNAL_SERVER_ERROR)
        .json({ message: "HARD_RESET_EXPIRED_TOKEN" });
    }

    await resetUsagers(structure);

    const key = `${join(
      domifaConfig().upload.bucketRootDir,
      "usager-documents",
      cleanPath(user.structure.uuid)
    )}/`;

    await this.fileManagerService.deleteAllUnderStructure(key);

    await this.structureHardResetService.hardResetClean(structure.id);

    return res.status(HttpStatus.OK).json({ message: "success" });
  }
}
