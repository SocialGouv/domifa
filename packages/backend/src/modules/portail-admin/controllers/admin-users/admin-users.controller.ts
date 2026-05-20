import {
  Body,
  Controller,
  Delete,
  Get,
  HttpStatus,
  Param,
  ParseIntPipe,
  ParseUUIDPipe,
  Patch,
  Post,
  Query,
  Res,
  UseGuards,
} from "@nestjs/common";
import { OtpGuard } from "../../../otp/guards/otp.guard";
import { RequireOtp } from "../../../otp/decorators/require-otp.decorator";
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
import { buildSupervisorActorFields } from "../../../app-logs/app-logs.helpers";
import { UserSupervisor, UsersForAdminList } from "@domifa/common";
import {
  userStructureRepository,
  userSupervisorRepository,
} from "../../../../database";

import {
  RegisterUserStructureAdminDto,
  RegisterUserSupervisorDto,
  UnblockUserDto,
} from "../../dto";
import { PageOptionsDto } from "../../../../usagers/dto/pagination/page-options.dto";
import { AdminStructuresService } from "../../services";
import { AdminSuperivorUsersService } from "../../services/admin-superivor-users/admin-superivor-users.service";
import { PatchUserSupervisorDto } from "../../dto/patch-user-supervisor.dto";
import { ElevateUserRoleDto } from "../../dto/elevate-user-role.dto";
import {
  UserSupervisorCrudLogContext,
  AdminUserRoleChangeLogContext,
} from "../../../app-logs/types/app-log-context.types";
import { CurrentSupervisor } from "../../../../auth/decorators/current-supervisor.decorator";
import { BrevoSenderService } from "../../../mails/services/brevo-sender/brevo-sender.service";

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
    private readonly adminStructuresService: AdminStructuresService,
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
      ...buildSupervisorActorFields(user),
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
        ...buildSupervisorActorFields(user),
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

    await this.brevoSenderService.sendUserActivationEmail({
      userId: newUser.id,
      userProfile: "supervisor",
      userSecurity,
    });

    await this.appLogsService.create<UserSupervisorCrudLogContext>({
      ...buildSupervisorActorFields(user),
      action: "ADMIN_USER_CREATE",
      context: {
        userId: newUser.id,
        role: registerUserDto.role,
      },
    });

    return res.status(HttpStatus.OK).json({ message: "OK" });
  }

  @ApiBearerAuth()
  @ApiOperation({
    summary: "Liste des utilisateurs des structures (vue super-admin)",
  })
  @Get("structure-users")
  public async getStructureUsers(): Promise<UsersForAdminList[]> {
    return this.adminStructuresService.getUsersForAdmin();
  }

  @ApiBearerAuth()
  @ApiOperation({ summary: "Débloquer un utilisateur supervisor (OTP requis)" })
  @Patch("supervisor/:userId/unblock")
  @UseGuards(OtpGuard)
  @RequireOtp("UNBLOCK_USER")
  public async unblockSupervisorUser(
    @CurrentSupervisor() user: UserAdminAuthenticated,
    @Param("userId", new ParseIntPipe()) userId: number,
    @Body() unblockDto: UnblockUserDto,
    @Res() res: ExpressResponse
  ): Promise<ExpressResponse> {
    await this.adminSuperivorUsersService.unblockSupervisorUser(userId);

    await this.appLogsService.create({
      ...buildSupervisorActorFields(user),
      action: "UNBLOCK_USER",
      context: {
        userId,
        userProfile: "supervisor",
        motif: unblockDto.motif,
      },
    });

    return res.status(HttpStatus.OK).json({ status: "ACTIVE" });
  }

  @ApiBearerAuth()
  @ApiOperation({ summary: "Logs d'activité d'un utilisateur supervisor" })
  @Get("supervisor/:userId/logs")
  public async getSupervisorUserLogs(
    @CurrentSupervisor() _user: UserAdminAuthenticated,
    @Param("userId", new ParseIntPipe()) userId: number,
    @Query() pageOptions: PageOptionsDto
  ) {
    return this.appLogsService.findUserLogs({
      userType: "user_supervisor",
      userId,
      page: pageOptions.page,
      take: pageOptions.take,
    });
  }

  @ApiBearerAuth()
  @ApiOperation({ summary: "Logs d'activité d'un utilisateur de structure" })
  @Get("structure-user/:userId/logs")
  public async getStructureUserLogs(
    @CurrentSupervisor() _user: UserAdminAuthenticated,
    @Param("userId", new ParseIntPipe()) userId: number,
    @Query() pageOptions: PageOptionsDto
  ) {
    return this.appLogsService.findUserLogs({
      userType: "user_structure",
      userId,
      page: pageOptions.page,
      take: pageOptions.take,
    });
  }

  @ApiBearerAuth()
  @ApiOperation({ summary: "Bloquer un utilisateur supervisor (OTP requis)" })
  @Patch("supervisor/:userId/block")
  @UseGuards(OtpGuard)
  @RequireOtp("BLOCK_USER_BY_ADMIN")
  public async blockSupervisorUser(
    @CurrentSupervisor() user: UserAdminAuthenticated,
    @Param("userId", new ParseIntPipe()) userId: number,
    @Res() res: ExpressResponse
  ): Promise<ExpressResponse> {
    if (user.id === userId) {
      return res
        .status(HttpStatus.BAD_REQUEST)
        .json({ message: "CANNOT_BLOCK_SELF" });
    }

    await this.adminSuperivorUsersService.blockSupervisorUser(userId);

    await this.appLogsService.create({
      ...buildSupervisorActorFields(user),
      action: "BLOCK_USER_BY_ADMIN",
      context: { userId, userProfile: "supervisor" },
    });

    return res.status(HttpStatus.OK).json({ status: "BLOCKED" });
  }

  @ApiBearerAuth()
  @ApiOperation({ summary: "Liste des utilisateurs superviseurs" })
  @Get("")
  public async getUsersSupervisors(): Promise<UserSupervisor[]> {
    return userSupervisorRepository.find({
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
        status: true,
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
      ...buildSupervisorActorFields(user),
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
        ...buildSupervisorActorFields(user),
        action: "ADMIN_USER_ROLE_CHANGE",
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
  @UseGuards(OtpGuard)
  @RequireOtp("DELETE_USER_BY_ADMIN")
  public async deleteUserSupervisor(
    @CurrentSupervisor() user: UserAdminAuthenticated,
    @Res() res: ExpressResponse,
    @Param("uuid", new ParseUUIDPipe()) uuid: string
  ): Promise<ExpressResponse> {
    await this.appLogsService.create({
      ...buildSupervisorActorFields(user),
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
    await this.appLogsService.create<UserSupervisorCrudLogContext>({
      ...buildSupervisorActorFields(user),
      action: "ADMIN_USER_DELETE",
      context: {
        userId: userExist.id,
        role: userExist.role,
      },
    });
    return res.status(HttpStatus.OK).json({ message: "OK" });
  }
}
