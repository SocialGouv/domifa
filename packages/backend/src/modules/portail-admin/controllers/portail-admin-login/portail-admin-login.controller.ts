import {
  Body,
  Controller,
  HttpCode,
  HttpStatus,
  Post,
  Res,
} from "@nestjs/common";
import { ApiTags } from "@nestjs/swagger";

import { ExpressResponse } from "../../../../util/express";
import {
  PortailAdminAuthApiResponse,
  PortailAdminProfile,
  UserProfile,
} from "../../../../_common/model";
import { StructureAdminLoginDto } from "../../../users/dto/structure-admin-login.dto";
import { AdminsAuthService } from "../../services/admins-auth.service";
import { userSecurityPasswordChecker } from "../../../users/services";
import { UserSupervisor } from "@domifa/common";

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

      const { access_token } = this.adminsAuthService.login(user);

      const portailAdminProfile: PortailAdminProfile = {
        user: {
          id: user.id,
          nom: user.nom,
          prenom: user.prenom,
          email: user.email,
          password: user.password,
          verified: user.verified,
          lastLogin: user.lastLogin,
          territories: user.territories,
          role: user.role,
        },
      };

      const response: PortailAdminAuthApiResponse = {
        token: access_token,
        profile: portailAdminProfile,
      };

      return res.status(HttpStatus.OK).json(response);
    } catch (err) {
      return res
        .status(HttpStatus.UNAUTHORIZED)
        .json({ message: "LOGIN_FAILED" });
    }
  }
}
