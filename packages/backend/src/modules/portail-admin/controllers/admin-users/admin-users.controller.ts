import {
  Body,
  Controller,
  Get,
  HttpStatus,
  Post,
  Res,
  UseGuards,
} from "@nestjs/common";
import { AuthGuard } from "@nestjs/passport";
import { ApiTags, ApiBearerAuth, ApiOperation } from "@nestjs/swagger";
import { UserStructureAuthenticated } from "../../../../_common/model";
import {
  AllowUserProfiles,
  AllowUserSupervisorRoles,
  CurrentUser,
} from "../../../../auth/decorators";
import { AppUserGuard } from "../../../../auth/guards";
import { ExpressResponse } from "../../../../util";
import { UsersController } from "../../../users/controllers/users.controller";

import { AppLogsService } from "../../../app-logs/app-logs.service";
import { UserSupervisor } from "@domifa/common";
import { userSupervisorRepository } from "../../../../database";

import { userAccountCreatedByAdminEmailSender } from "../../../mails/services/templates-renderers";

import {
  RegisterUserStructureAdminDto,
  RegisterUserSupervisorAdminDto,
} from "../../dto";
import { AdminSuperivorUsersService } from "../../services/admin-superivor-users/admin-superivor-users.service";

@UseGuards(AuthGuard("jwt"), AppUserGuard)
@ApiTags("dashboard")
@AllowUserProfiles("supervisor")
@AllowUserSupervisorRoles("super-admin-domifa")
@ApiBearerAuth()
@Controller("admin/users")
export class AdminUsersController {
  constructor(
    private readonly appLogsService: AppLogsService,
    private readonly adminSuperivorUsersService: AdminSuperivorUsersService
  ) {}

  @Post("register")
  public async registerNewAdmin(
    @CurrentUser() user: UserStructureAuthenticated,
    @Res() res: ExpressResponse,
    @Body() registerUserDto: RegisterUserStructureAdminDto
  ): Promise<ExpressResponse> {
    const userController = new UsersController();
    await this.appLogsService.create({
      userId: user.id,
      action: "ADMIN_CREATE_USER_STRUCTURE",
    });
    return await userController.registerUser(user, res, registerUserDto);
  }

  @Post("register-new-supervisor")
  public async registerNewSupervisor(
    @CurrentUser() user: UserStructureAuthenticated,
    @Res() res: ExpressResponse,
    @Body() registerUserDto: RegisterUserSupervisorAdminDto
  ): Promise<ExpressResponse> {
    await this.appLogsService.create({
      userId: user.id,
      action: "ADMIN_CREATE_USER_SUPERVISOR",
    });

    const userExist = await userSupervisorRepository.findOneBy({
      email: registerUserDto.email.toLowerCase(),
    });

    if (userExist) {
      return res
        .status(HttpStatus.BAD_REQUEST)
        .json({ message: "EMAIL_EXIST" });
    }

    const { user: newUser, userSecurity } =
      await this.adminSuperivorUsersService.createUserWithTmpToken(
        registerUserDto
      );

    if (newUser) {
      return userAccountCreatedByAdminEmailSender
        .sendMail({
          user: newUser,
          token: userSecurity.temporaryTokens.token,
          userProfile: "supervisor",
        })
        .then(
          () => {
            return res.status(HttpStatus.OK).json({ message: "OK" });
          },
          () => {
            return res
              .status(HttpStatus.INTERNAL_SERVER_ERROR)
              .json({ message: "REGISTER_ERROR" });
          }
        );
    }
    return res
      .status(HttpStatus.INTERNAL_SERVER_ERROR)
      .json({ message: "REGISTER_ERROR" });
  }

  @ApiBearerAuth()
  @ApiOperation({ summary: "Liste des utilisateurs superviseurs" })
  @Get("")
  public async getUsers(): Promise<UserSupervisor[]> {
    const users = await userSupervisorRepository.find({
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
      },
    });
    return users;
  }
}
