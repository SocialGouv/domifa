import { Usager, UserUsager } from "@domifa/common";
import {
  Body,
  Controller,
  Get,
  HttpStatus,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Res,
  UseGuards,
} from "@nestjs/common";
import {
  USER_STRUCTURE_ROLE_ALL,
  UserStructureAuthenticated,
} from "../../../../_common/model";
import {
  AllowUserProfiles,
  AllowUserStructureRoles,
  CurrentUsager,
  CurrentUser,
} from "../../../../auth/decorators";
import { AppUserGuard, UsagerAccessGuard } from "../../../../auth/guards";
import {
  structureRepository,
  usagerRepository,
  userUsagerRepository,
} from "../../../../database";
import { appLogger, ExpressResponse } from "../../../../util";
import { Response } from "express";

import { AuthGuard } from "@nestjs/passport";
import { ApiTags, ApiBearerAuth } from "@nestjs/swagger";
import {
  StructureEditPortailUsagerDto,
  UpdatePortailUsagerOptionsDto,
} from "../../dto";
import { AppLogsService } from "../../../app-logs/app-logs.service";
import { userUsagerCreator, userUsagerUpdator } from "../../services";

@Controller("portail-usagers-manager")
@ApiTags("portail-usagers-manager")
@UseGuards(AuthGuard("jwt"), AppUserGuard)
@AllowUserProfiles("structure")
@AllowUserStructureRoles(...USER_STRUCTURE_ROLE_ALL)
@ApiBearerAuth()
export class PortailUsagersManagerController {
  constructor(private readonly appLogsService: AppLogsService) {}

  @AllowUserStructureRoles("admin")
  @Patch("configure-structure")
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

      if (
        user.structure.sms.enabledByStructure !==
        structurePortailUsagerDto.enabledByStructure
      ) {
        const action = structurePortailUsagerDto.enabledByStructure
          ? "ENABLE_PORTAIL_BY_STRUCTURE"
          : "DISABLE_PORTAIL_BY_STRUCTURE";

        await this.appLogsService.create({
          userId: user._userId,
          usagerRef: null,
          structureId: user.structureId,
          action,
        });
      }

      const structure = await structureRepository.findOneBy({
        id: user.structureId,
      });
      return res.status(HttpStatus.OK).json(structure);
    } catch (e) {
      appLogger.error("PORTAIL_UPDATE_FAIL", { error: e, sentry: true });
      return res
        .status(HttpStatus.INTERNAL_SERVER_ERROR)
        .json({ message: "PORTAIL_UPDATE_FAIL" });
    }
  }

  @UseGuards(UsagerAccessGuard)
  @AllowUserStructureRoles(...USER_STRUCTURE_ROLE_ALL)
  @Get(":usagerRef")
  public async findOne(
    @Param("usagerRef", new ParseIntPipe()) _usagerRef: number,
    @CurrentUsager() currentUsager: Usager
  ): Promise<UserUsager | null> {
    return await userUsagerRepository.findOne({
      where: {
        usagerUUID: currentUsager.uuid,
      },
      select: [
        "updatedAt",
        "login",
        "isTemporaryPassword",
        "lastLogin",
        "passwordLastUpdate",
        "enabled",
      ],
    });
  }

  @UseGuards(UsagerAccessGuard)
  @AllowUserStructureRoles("simple", "responsable", "admin")
  @Post("enable-access/:usagerRef")
  public async editPreupdatePortailUsagerOptionsference(
    @Res() res: Response,
    @Body() dto: UpdatePortailUsagerOptionsDto,
    @CurrentUsager() usager: Usager,
    @CurrentUser() user: UserStructureAuthenticated
  ) {
    try {
      usager.options.portailUsagerEnabled = dto.portailUsagerEnabled;
      await usagerRepository.update(
        { uuid: usager.uuid },
        {
          options: usager.options,
        }
      );

      if (usager.options.portailUsagerEnabled) {
        const userUsager = await userUsagerRepository.findOneBy({
          usagerUUID: usager.uuid,
        });

        if (!userUsager) {
          const { login, temporaryPassword } =
            await userUsagerCreator.createUserWithTmpPassword(
              {
                usagerUUID: usager.uuid,
                structureId: usager.structureId,
              },
              { creator: user }
            );
          return res
            .status(HttpStatus.CREATED)
            .json({ usager, login, temporaryPassword });
        } else {
          const generateNewPassword =
            dto.portailUsagerEnabled && dto.generateNewPassword;

          const { userUsager, temporaryPassword } =
            await userUsagerUpdator.enableUser({
              usagerUUID: usager.uuid,
              generateNewPassword,
            });

          await this.appLogsService.create({
            userId: user.id,
            usagerRef: usager.ref,
            structureId: user.structureId,
            action: "RESET_PASSWORD_PORTAIL",
          });

          return res.status(HttpStatus.CREATED).json({
            usager,
            login: generateNewPassword ? userUsager.login : undefined,
            temporaryPassword,
          });
        }
      } else {
        // disable login
        await userUsagerUpdator.disableUser({ usagerUUID: usager.uuid });
      }
      return res.status(HttpStatus.OK).json({ usager });
    } catch (error) {
      appLogger.error("Error updating usager options", {
        error,
        sentry: true,
      });
      return res
        .status(HttpStatus.INTERNAL_SERVER_ERROR)
        .json({ message: "ERROR_UPDATING_OPTIONS" });
    }
  }
}
