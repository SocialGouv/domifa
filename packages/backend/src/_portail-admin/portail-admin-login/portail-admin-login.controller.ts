import {
  Body,
  Controller,
  HttpCode,
  HttpStatus,
  Post,
  Res,
} from "@nestjs/common";
import { ApiTags } from "@nestjs/swagger";
import { userAdminSecurityPasswordChecker } from "../../database/services/user-admin";

import { ExpressResponse } from "../../util/express";
import {
  PortailAdminAuthApiResponse,
  PortailAdminProfile,
} from "../../_common/model";
import { portailAdminProfilBuilder } from "../portail-admin-profil/services/portail-admin-profil-builder.service";
import { AdminsAuthService } from "./services";
import { StructureAdminLoginDto } from "../../users/dto/structure-admin-login.dto";

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
      const user = await userAdminSecurityPasswordChecker.checkPassword({
        email: loginDto.email,
        password: loginDto.password,
      });

      const { access_token } = await this.adminsAuthService.login(user);

      const portailAdminProfile: PortailAdminProfile =
        await portailAdminProfilBuilder.build({ userId: user.id });

      const response: PortailAdminAuthApiResponse = {
        token: access_token,
        profile: portailAdminProfile,
      };

      return res.status(HttpStatus.OK).json(response);
    } catch (err) {
      return res
        .status(HttpStatus.UNAUTHORIZED)
        .json({ message: "WRONG_CREDENTIALS" });
    }
  }
}
