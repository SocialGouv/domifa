import { Usager, UserUsager } from "@domifa/common";
import {
  Body,
  Controller,
  Get,
  HttpStatus,
  Param,
  ParseIntPipe,
  Post,
  Res,
  UseGuards,
} from "@nestjs/common";
import {
  USER_STRUCTURE_ROLE_ALL,
  UserStructureAuthenticated,
} from "../../../../_common/model";
import {
  AllowUserStructureRoles,
  CurrentUsager,
  CurrentUser,
} from "../../../../auth/decorators";
import { AppUserGuard, UsagerAccessGuard } from "../../../../auth/guards";
import { usagerRepository, userUsagerRepository } from "../../../../database";
import {
  userUsagerCreator,
  userUsagerUpdator,
} from "../../../../users/services";
import { appLogger } from "../../../../util";
import { UpdatePortailUsagerOptionsDto } from "../../dto";
import { Response } from "express";
import { AppLogsService } from "../../../app-logs/app-logs.service";
import { AuthGuard } from "@nestjs/passport";
import { ApiTags, ApiBearerAuth } from "@nestjs/swagger";

@Controller("portail-usagers-manager")
@ApiTags("portail-usagers-manager")
@UseGuards(AuthGuard("jwt"), AppUserGuard)
@ApiBearerAuth()
export class PortailUsagersManagerController {
  constructor(private readonly appLogsService: AppLogsService) {}

  @UseGuards(UsagerAccessGuard)
  @AllowUserStructureRoles(...USER_STRUCTURE_ROLE_ALL)
  @Get(":usagerRef")
  public async findOne(
    @Param("usagerRef", new ParseIntPipe()) _usagerRef: number,
    @CurrentUsager() currentUsager: Usager
  ): Promise<UserUsager | null> {
    console.log();
    return userUsagerRepository.findOne({
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
      const updatedUsager = await usagerRepository.updateOneAndReturn(
        usager.uuid,
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
            .json({ usager: updatedUsager, login, temporaryPassword });
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
            usager: updatedUsager,
            login: generateNewPassword ? userUsager.login : undefined,
            temporaryPassword,
          });
        }
      } else {
        // disable login
        await userUsagerUpdator.disableUser({ usagerUUID: usager.uuid });
      }
      return res.status(HttpStatus.OK).json({ usager: updatedUsager });
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
