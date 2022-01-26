import {
  Body,
  Controller,
  Get,
  HttpException,
  HttpStatus,
  Param,
  Patch,
  Res,
  UseGuards,
} from "@nestjs/common";
import { AuthGuard } from "@nestjs/passport";
import { ApiBearerAuth, ApiTags } from "@nestjs/swagger";
import { AllowUserStructureRoles } from "../../auth/decorators";
import { CurrentUser } from "../../auth/decorators/current-user.decorator";
import { AppUserGuard } from "../../auth/guards";
import { structureRepository } from "../../database";
import { hardResetEmailSender } from "../../mails/services/templates-renderers";
import { ExpressResponse } from "../../util/express";
import {
  UserStructureAuthenticated,
  USER_STRUCTURE_ROLE_ALL,
} from "../../_common/model";
import { StructureDto, StructureEditPortailUsagerDto } from "../dto";
import { StructureEditSmsDto } from "../dto/structure-edit-sms.dto";

import { structureDeletorService } from "../services/structureDeletor.service";
import { StructureHardResetService } from "../services/structureHardReset.service";
import { StructuresService } from "../services/structures.service";
import { AppLogsService } from "../../modules/app-logs/app-logs.service";

@Controller("structures")
@UseGuards(AuthGuard("jwt"), AppUserGuard)
@ApiTags("structures")
export class StructuresController {
  constructor(
    private structureHardResetService: StructureHardResetService,
    private structureService: StructuresService,
    private appLogsService: AppLogsService
  ) {}

  @ApiBearerAuth()
  @AllowUserStructureRoles("admin")
  @Patch("portail-usager/configure-structure")
  public async toggleEnablePortailUsagerByStructure(
    @CurrentUser() user: UserStructureAuthenticated,
    @Body() structurePortailUsagerDto: StructureEditPortailUsagerDto
  ) {
    const portailUsager = user.structure.portailUsager;
    if (!portailUsager.enabledByDomifa) {
      throw new HttpException(
        "SMS_NOT_ENABLED_BY_DOMIFA",
        HttpStatus.BAD_REQUEST
      );
    }

    return structureRepository.updateOne(
      { id: user.structureId },
      {
        portailUsager: {
          ...portailUsager,
          enabledByStructure: structurePortailUsagerDto.enabledByStructure,
        },
      }
    );
  }

  @ApiBearerAuth()
  @AllowUserStructureRoles("admin")
  @Patch()
  public async patchStructure(
    @Body() structureDto: StructureDto,
    @CurrentUser() user: UserStructureAuthenticated
  ) {
    return this.structureService.patch(structureDto, user);
  }

  @ApiBearerAuth()
  @AllowUserStructureRoles("admin")
  @Patch("sms")
  public async patchSmsParams(
    @Body() structureSmsDto: StructureEditSmsDto,
    @CurrentUser() user: UserStructureAuthenticated
  ) {
    if (!user.structure.sms.enabledByDomifa) {
      throw new HttpException(
        "SMS_NOT_ENABLED_BY_DOMIFA",
        HttpStatus.BAD_REQUEST
      );
    }

    const action =
      user.structure.sms.enabledByDomifa &&
      user.structure.sms.enabledByStructure
        ? "ENABLE_SMS_BY_STRUCTURE"
        : "DISABLE_SMS_BY_STRUCTURE";
    this.appLogsService.create({
      userId: user._userId,
      usagerRef: null,
      structureId: user.structureId,
      action,
    });

    structureSmsDto.enabledByDomifa = user.structure.sms.enabledByDomifa;

    return this.structureService.patchSmsParams(structureSmsDto, user);
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
    const charset = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
    const expireAt = new Date();
    expireAt.setDate(expireAt.getDate() + 1);

    let token = "";
    for (let i = 0; i < 7; i++) {
      token += charset.charAt(Math.floor(Math.random() * charset.length));
    }
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
      throw new HttpException(
        "HARD_RESET_ERROR",
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  @AllowUserStructureRoles("admin")
  @ApiBearerAuth()
  @Get("hard-reset-confirm/:token")
  public async hardResetConfirm(
    @Res() res: ExpressResponse,
    @Param("token") token: string,
    @CurrentUser() user: UserStructureAuthenticated
  ) {
    const structure = await structureRepository.checkHardResetToken({
      userId: user.id,
      token,
    });

    if (!structure) {
      throw new HttpException(
        "HARD_RESET_INCORRECT_TOKEN",
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }

    const now = new Date();

    if (structure.hardReset.expireAt && structure.hardReset.expireAt < now) {
      throw new HttpException(
        "HARD_RESET_EXPIRED_TOKEN",
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }

    await structureDeletorService.deleteStructureUsagers({
      structureId: structure.id,
    });

    await this.structureHardResetService.hardResetClean(structure.id);

    return res.status(HttpStatus.OK).json({ message: "success" });
  }
}
