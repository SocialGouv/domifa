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
import { UserProfile } from "../../../../_common/model";
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

      const accessToken = this.adminsAuthService.login(user);
      return res.status(HttpStatus.OK).json(accessToken);
    } catch (err) {
      return res
        .status(HttpStatus.UNAUTHORIZED)
        .json({ message: "LOGIN_FAILED" });
    }
  }
}
