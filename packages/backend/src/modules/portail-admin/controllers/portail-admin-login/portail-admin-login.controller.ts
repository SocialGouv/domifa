import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Post,
  Res,
  UseGuards,
} from "@nestjs/common";
import { ApiTags } from "@nestjs/swagger";

import { ExpressResponse } from "../../../../util/express";
import { UserAdminAuthenticated, UserProfile } from "../../../../_common/model";
import { StructureAdminLoginDto } from "../../../users/dto/structure-admin-login.dto";
import { AdminsAuthService } from "../../services/admins-auth.service";
import { userSecurityPasswordChecker } from "../../../users/services";
import { UserSupervisor } from "@domifa/common";
import { AuthGuard } from "@nestjs/passport";
import { USER_SUPERVISOR_ROLES } from "../../../../_common/model/users/user-supervisor";
import {
  AllowUserProfiles,
  AllowUserSupervisorRoles,
  CurrentUser,
} from "../../../../auth/decorators";
import { AppUserGuard } from "../../../../auth/guards";
import { portailAdminProfilBuilder } from "../../services/portail-admin-profil-builder.service";

const userProfile: UserProfile = "supervisor";
@Controller("portail-admins/auth")
@ApiTags("auth")
export class PortailAdminLoginController {
  constructor(private readonly adminsAuthService: AdminsAuthService) {}

  @Post("login")
  @HttpCode(HttpStatus.OK)
  public async loginUser(
    @Res() res: ExpressResponse,
    @Body() loginDto: StructureAdminLoginDto
  ) {
    try {
      const user =
        await userSecurityPasswordChecker.checkPassword<UserSupervisor>({
          email: loginDto.email,
          password: loginDto.password,
          userProfile,
        });

      const accessToken = this.adminsAuthService.login(user);
      return res.status(HttpStatus.OK).json(accessToken);
    } catch (err) {
      return res
        .status(HttpStatus.UNAUTHORIZED)
        .json({ message: "LOGIN_FAILED" });
    }
  }

  @Get("me")
  @UseGuards(AuthGuard("jwt"), AppUserGuard)
  @AllowUserProfiles("supervisor")
  @AllowUserSupervisorRoles(...USER_SUPERVISOR_ROLES)
  public async meAdmin(@CurrentUser() currentUser: UserAdminAuthenticated) {
    return await portailAdminProfilBuilder.build({
      userId: currentUser._userId,
    });
  }
}
