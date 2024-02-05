import { appLogger } from "./../../util/AppLogger.service";
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
import { AllowUserStructureRoles, CurrentUser } from "../../auth/decorators";
import { structureRepository } from "../../database";
import { hardResetEmailSender } from "../../mails/services/templates-renderers";
import { ExpressResponse } from "../../util/express";
import {
  UserStructureAuthenticated,
  USER_STRUCTURE_ROLE_ALL,
} from "../../_common/model";
import { StructureDto, StructureEditPortailUsagerDto } from "../dto";
import { StructureEditSmsDto } from "../dto/structure-edit-sms.dto";

import { structureDeletorService } from "../services/structure-deletor.service";
import { StructureHardResetService } from "../services/structureHardReset.service";
import { StructuresService } from "../services/structures.service";
import { AppLogsService } from "../../modules/app-logs/app-logs.service";

import { ParseHardResetTokenPipe } from "../../_common/decorators";

import { faker } from "@faker-js/faker";
import { AppUserGuard } from "../../auth/guards";
import {
  DEPARTEMENTS_MAP,
  getDepartementFromCodePostal,
  getRegionCodeFromDepartement,
} from "@domifa/common";

@Controller("structures")
@UseGuards(AuthGuard("jwt"), AppUserGuard)
@ApiTags("structures")
export class StructuresController {
  constructor(
    private readonly structureHardResetService: StructureHardResetService,
    private readonly structureService: StructuresService,
    private readonly appLogsService: AppLogsService
  ) {}

  @ApiBearerAuth()
  @AllowUserStructureRoles("admin")
  @Patch("portail-usager/configure-structure")
  public async toggleEnablePortailUsagerByStructure(
    @CurrentUser() user: UserStructureAuthenticated,
    @Body() structurePortailUsagerDto: StructureEditPortailUsagerDto,
    @Res() res: ExpressResponse
  ) {
    const portailUsager = user.structure.portailUsager;

    if (!portailUsager.enabledByDomifa) {
      return res
        .status(HttpStatus.BAD_REQUEST)
        .json({ message: "PORTAIL_NOT_ENABLED_BY_DOMIFA" });
    }

    try {
      await structureRepository.update(
        { id: user.structureId },
        {
          portailUsager: {
            enabledByDomifa: true,
            enabledByStructure: structurePortailUsagerDto.enabledByStructure,
            usagerLoginUpdateLastInteraction:
              structurePortailUsagerDto.usagerLoginUpdateLastInteraction,
          },
        }
      );
      const retour = await structureRepository.findOneBy({
        id: user.structureId,
      });
      return res.status(HttpStatus.OK).json(retour);
    } catch (e) {
      appLogger.error("PORTAIL_UPDATE_FAIL", { error: e, sentry: true });
      return res
        .status(HttpStatus.INTERNAL_SERVER_ERROR)
        .json({ message: "PORTAIL_UPDATE_FAIL" });
    }
  }

  @ApiBearerAuth()
  @AllowUserStructureRoles("admin")
  @Patch()
  public async patchStructure(
    @Body() structureDto: StructureDto,
    @CurrentUser() user: UserStructureAuthenticated
  ) {
    delete structureDto.readCgu;
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

  @ApiBearerAuth()
  @AllowUserStructureRoles("admin")
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

    if (
      user.structure.sms.enabledByStructure !==
      structureSmsDto.enabledByStructure
    ) {
      const action =
        structureSmsDto.enabledByStructure === true
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
  @ApiBearerAuth()
  @Get("ma-structure")
  public async getMyStructure(@CurrentUser() user: UserStructureAuthenticated) {
    return user.structure;
  }

  @AllowUserStructureRoles("admin")
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

  @AllowUserStructureRoles("admin")
  @ApiBearerAuth()
  @Get("hard-reset-confirm/:token")
  public async hardResetConfirm(
    @Res() res: ExpressResponse,
    @CurrentUser() user: UserStructureAuthenticated,
    @Param("token", new ParseHardResetTokenPipe()) token: string
  ) {
    const structure = await structureRepository.checkHardResetToken({
      userId: user.id,
      token: token,
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

    await structureDeletorService.deleteStructureUsagers(structure);

    await this.structureHardResetService.hardResetClean(structure.id);

    return res.status(HttpStatus.OK).json({ message: "success" });
  }
}
