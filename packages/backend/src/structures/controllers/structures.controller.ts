import {
  Body,
  Controller,
  Delete,
  Get,
  HttpException,
  HttpStatus,
  Param,
  Patch,
  Response,
  UseGuards,
} from "@nestjs/common";
import { AuthGuard } from "@nestjs/passport";
import { ApiBearerAuth, ApiTags } from "@nestjs/swagger";
import {
  AllowUserStructureRoles,
  AllowUserProfiles,
} from "../../auth/decorators";
import { CurrentUser } from "../../auth/decorators/current-user.decorator";
import { AppUserGuard } from "../../auth/guards";
import { structureRepository } from "../../database";
import { structureLightRepository } from "../../database/services/structure/structureLightRepository.service";
import {
  deleteStructureEmailSender,
  hardResetEmailSender,
} from "../../mails/services/templates-renderers";
import {
  UserStructureAuthenticated,
  USER_STRUCTURE_ROLE_ALL,
} from "../../_common/model";
import { StructureEditSmsDto } from "../dto/structure-edit-sms.dto";
import { StructureEditDto } from "../dto/structure-edit.dto";
import { structureDeletorService } from "../services/structureDeletor.service";
import { StructureHardResetService } from "../services/structureHardReset.service";
import { StructuresService } from "../services/structures.service";

@Controller("structures")
@UseGuards(AuthGuard("jwt"), AppUserGuard)
@ApiTags("structures")
export class StructuresController {
  constructor(
    private structureHardResetService: StructureHardResetService,
    private structureService: StructuresService
  ) {}

  @ApiBearerAuth()
  @AllowUserStructureRoles("admin")
  @Patch()
  public async patchStructure(
    @Body() structureDto: StructureEditDto,
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
    @Response() res: any,
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
    @Response() res: any,
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

  @AllowUserProfiles("super-admin-domifa")
  @ApiBearerAuth()
  @Delete("confirm/:id/:token/:nom")
  public async deleteOne(
    @Param("id") id: string,
    @Param("token") token: string,
    @Param("nom") nom: string
  ) {
    return structureDeletorService.deleteStructure({
      structureId: parseInt(id, 10),
      token,
      structureNom: nom,
    });
  }

  @AllowUserProfiles("super-admin-domifa")
  @ApiBearerAuth()
  @Delete("check/:id/:token")
  public async checkDelete(
    @Param("id") id: string,
    @Param("token") token: string
  ) {
    const structure = await structureLightRepository.findOne({
      token,
      id: parseInt(id, 10),
    });
    if (!structure) {
      throw new HttpException(
        "HARD_RESET_INCORRECT_TOKEN",
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
    return structure;
  }

  @AllowUserProfiles("super-admin-domifa")
  @ApiBearerAuth()
  @Delete(":id")
  public async sendMailConfirmDeleteStructure(
    @Response() res: any,
    @Param("id") id: string
  ) {
    const structure = await structureDeletorService.generateDeleteToken(
      parseInt(id, 10)
    );

    if (!!structure) {
      deleteStructureEmailSender.sendMail({ structure }).then(
        (result) => {
          return res.status(HttpStatus.OK).json({ message: "OK" });
        },
        (error) => {
          return res
            .status(HttpStatus.INTERNAL_SERVER_ERROR)
            .json({ message: "MAIL_DELETE_STRUCTURE_ERROR" });
        }
      );
    } else {
      return res
        .status(HttpStatus.INTERNAL_SERVER_ERROR)
        .json({ message: "DELETED_STRUCTURE_NOT_FOUND" });
    }
    return true;
  }
}
