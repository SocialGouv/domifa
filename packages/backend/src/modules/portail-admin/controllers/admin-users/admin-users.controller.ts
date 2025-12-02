import {
  Body,
  Controller,
  Delete,
  Get,
  HttpStatus,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  Res,
  UseGuards,
} from "@nestjs/common";
import { AuthGuard } from "@nestjs/passport";
import { ApiTags, ApiBearerAuth, ApiOperation } from "@nestjs/swagger";
import { UserAdminAuthenticated } from "../../../../_common/model";
import {
  AllowUserProfiles,
  AllowUserSupervisorRoles,
} from "../../../../auth/decorators";
import { AppUserGuard } from "../../../../auth/guards";
import { appLogger, ExpressResponse } from "../../../../util";
import { UsersController } from "../../../users/controllers/users.controller";

import { AppLogsService } from "../../../app-logs/app-logs.service";
import { UserSupervisor } from "@domifa/common";
import {
  userStructureRepository,
  userSupervisorRepository,
} from "../../../../database";

import {
  RegisterUserStructureAdminDto,
  RegisterUserSupervisorDto,
} from "../../dto";
import { AdminSuperivorUsersService } from "../../services/admin-superivor-users/admin-superivor-users.service";
import { PatchUserSupervisorDto } from "../../dto/patch-user-supervisor.dto";
import { ElevateUserRoleDto } from "../../dto/elevate-user-role.dto";
import {
  AdminUserCrudLogContext,
  AdminUserRoleChangeLogContext,
} from "../../../app-logs/types/app-log-context.types";
import { CurrentSupervisor } from "../../../../auth/decorators/current-supervisor.decorator";
import { BrevoSenderService } from "../../../mails/services/brevo-sender/brevo-sender.service";
import { userSecurityResetPasswordInitiator } from "../../../users/services";
import { domifaConfig } from "../../../../config";

@UseGuards(AuthGuard("jwt"), AppUserGuard)
@ApiTags("dashboard")
@AllowUserProfiles("supervisor")
@AllowUserSupervisorRoles("super-admin-domifa")
@ApiBearerAuth()
@Controller("admin/users")
export class AdminUsersController {
  constructor(
    private readonly appLogsService: AppLogsService,
    private readonly adminSuperivorUsersService: AdminSuperivorUsersService,
    private readonly brevoSenderService: BrevoSenderService
  ) {}

  @Post("register-user-structure")
  public async registerUserStructureAdmin(
    @CurrentSupervisor() user: UserAdminAuthenticated,
    @Res() res: ExpressResponse,
    @Body() registerUserDto: RegisterUserStructureAdminDto
  ): Promise<ExpressResponse> {
    const userController = new UsersController(
      this.appLogsService,
      this.brevoSenderService
    );
    await this.appLogsService.create({
      userId: user.id,
      action: "ADMIN_CREATE_USER_STRUCTURE",
    });
    return await userController.registerUser(user, res, registerUserDto);
  }

  @Patch("elevate-user-role")
  public async elevateUserRoleToAdmin(
    @CurrentSupervisor() user: UserAdminAuthenticated,
    @Res() res: ExpressResponse,
    @Body() elevateRoleDto: ElevateUserRoleDto
  ): Promise<ExpressResponse> {
    const { uuid } = elevateRoleDto;
    try {
      const userToElevate = await userStructureRepository.findOneByOrFail({
        uuid,
      });

      if (userToElevate.role === "admin") {
        throw new Error("User is already and admin");
      }

      await userStructureRepository.update(
        {
          uuid: userToElevate.uuid,
        },
        {
          role: "admin",
        }
      );
      await this.appLogsService.create<AdminUserRoleChangeLogContext>({
        userId: user.id,
        action: "ADMIN_ELEVATE_ROLE_USER_SUPERVISOR",
      });

      return res.status(HttpStatus.OK).send({
        message: "OK",
      });
    } catch (e) {
      appLogger.error(e);
      return res.status(HttpStatus.BAD_REQUEST).send({
        message: "UNABLE_TO_ELEVATE_USER_ROLE",
      });
    }
  }

  @Post("register-user-supervisor")
  public async registerNewSupervisor(
    @CurrentSupervisor() user: UserAdminAuthenticated,
    @Res() res: ExpressResponse,
    @Body() registerUserDto: RegisterUserSupervisorDto
  ): Promise<ExpressResponse> {
    const userExist = await userSupervisorRepository.findOneBy({
      email: registerUserDto.email.toLowerCase(),
    });

    if (userExist) {
      return res
        .status(HttpStatus.BAD_REQUEST)
        .json({ message: "BAD_REQUEST" });
    }

    const { user: newUser, userSecurity } =
      await this.adminSuperivorUsersService.createUserWithTmpToken(
        registerUserDto
      );

    if (!newUser) {
      return res
        .status(HttpStatus.INTERNAL_SERVER_ERROR)
        .json({ message: "REGISTER_ERROR" });
    }

    const link = userSecurityResetPasswordInitiator.buildResetPasswordLink({
      token: userSecurity.temporaryTokens.token,
      userId: user.id,
      userProfile: "supervisor",
    });

    await this.brevoSenderService.sendEmailWithTemplate({
      templateId: domifaConfig().brevo.templates.userStructureCreatedByAdmin,
      subject: "[DOMIFA] Finalisez votre inscription sur DomiFa",
      to: [
        {
          email: user.email,
          name: `${user.prenom} ${user.nom}`,
        },
      ],
      params: {
        lien: link,
        prenom: user.prenom,
      },
    });

    await this.appLogsService.create<AdminUserCrudLogContext>({
      action: "ADMIN_USER_CREATE",
      userId: user.id,
      context: {
        userId: newUser.id,
        role: registerUserDto.role,
      },
    });

    return res.status(HttpStatus.OK).json({ message: "OK" });
  }

  @ApiBearerAuth()
  @ApiOperation({ summary: "Liste des utilisateurs superviseurs" })
  @Get("")
  public async getUsersSupervisors(): Promise<UserSupervisor[]> {
    return userSupervisorRepository.find({
      where: {},
      select: {
        nom: true,
        prenom: true,
        id: true,
        role: true,
        email: true,
        lastLogin: true,
        createdAt: true,
        territories: true,
        uuid: true,
      },
    });
  }

  @Patch(":uuid")
  public async patchUserSupervisor(
    @CurrentSupervisor() user: UserAdminAuthenticated,
    @Res() res: ExpressResponse,
    @Body() patchUserDto: PatchUserSupervisorDto,
    @Param("uuid", new ParseUUIDPipe()) uuid: string
  ): Promise<ExpressResponse> {
    await this.appLogsService.create({
      userId: user.id,
      action: "ADMIN_PATCH_USER_SUPERVISOR",
    });

    const userExist = await userSupervisorRepository.findOneBy({
      uuid,
    });

    if (!userExist) {
      return res
        .status(HttpStatus.BAD_REQUEST)
        .json({ message: "CANNOT_PATCH_USER_SUPERVISOR" });
    }
    await userSupervisorRepository.update({ uuid }, { ...patchUserDto });

    if (userExist.role !== patchUserDto.role) {
      await this.appLogsService.create<AdminUserRoleChangeLogContext>({
        action: "ADMIN_USER_ROLE_CHANGE",
        userId: user.id,
        context: {
          userId: userExist.id,
          newRole: patchUserDto.role,
          oldRole: userExist.role,
        },
      });
    }
    return res.status(HttpStatus.OK).json({ message: "OK" });
  }

  @Delete(":uuid")
  public async deleteUserSupervisor(
    @CurrentSupervisor() user: UserAdminAuthenticated,
    @Res() res: ExpressResponse,
    @Param("uuid", new ParseUUIDPipe()) uuid: string
  ): Promise<ExpressResponse> {
    await this.appLogsService.create({
      userId: user.id,
      action: "ADMIN_DELETE_USER_SUPERVISOR",
    });

    const userExist = await userSupervisorRepository.findOneBy({
      uuid,
    });

    if (!userExist || userExist?.uuid === user.uuid) {
      return res
        .status(HttpStatus.BAD_REQUEST)
        .json({ message: "CANNOT_PATCH_USER_SUPERVISOR" });
    }
    await userSupervisorRepository.delete({ uuid });
    await this.appLogsService.create<AdminUserCrudLogContext>({
      action: "ADMIN_USER_DELETE",
      userId: user.id,
      context: {
        userId: userExist.id,
        role: userExist.role,
      },
    });
    return res.status(HttpStatus.OK).json({ message: "OK" });
  }
}
