import { structureRepository } from "./../../database/services/structure/structureRepository.service";
import {
  Body,
  Controller,
  HttpCode,
  HttpStatus,
  Post,
  Res,
} from "@nestjs/common";
import { ApiTags } from "@nestjs/swagger";
import {
  UserUsagerLoginTable,
  usagerRepository,
  userUsagerLoginRepository,
  userUsagerSecurityPasswordChecker,
} from "../../database";
import { UsagerLoginDto } from "../../users/dto";
import { ExpressResponse } from "../../util/express";
import {
  PortailUsagerAuthApiResponse,
  PortailUsagerProfile,
} from "../../_common/model";
import { portailUsagerProfilBuilder } from "../portail-usager-profil/services/portail-usager-profil-builder.service";
import { UsagersAuthService } from "./services/usagers-auth.service";

@Controller("portail-usagers/auth")
@ApiTags("auth")
export class PortailUsagersLoginController {
  constructor(private readonly usagersAuthService: UsagersAuthService) {}

  @Post("login")
  @HttpCode(HttpStatus.OK)
  public async loginUser(
    @Res() res: ExpressResponse,
    @Body() loginDto: UsagerLoginDto
  ) {
    try {
      const user = await userUsagerSecurityPasswordChecker.checkPassword({
        login: loginDto.login,
        password: loginDto.password,
        newPassword: loginDto.newPassword,
      });

      if (user.isTemporaryPassword) {
        return res
          .status(HttpStatus.UNAUTHORIZED)
          .json({ message: "CHANGE_PASSWORD_REQUIRED" });
      }

      const { access_token } = await this.usagersAuthService.login(user);

      const portailUsagerProfile: PortailUsagerProfile =
        await portailUsagerProfilBuilder.build({ usagerUUID: user.usagerUUID });

      const usager = await usagerRepository.findOneBy({
        uuid: user.usagerUUID,
      });

      const structure = await structureRepository.findOneByOrFail({
        id: user.structureId,
      });

      const lastLogin = await userUsagerLoginRepository.save(
        new UserUsagerLoginTable({
          usagerUUID: usager.uuid,
          structureId: usager.structureId,
        })
      );

      if (structure.portailUsager.usagerLoginUpdateLastInteraction) {
        usager.lastInteraction.dateInteraction = lastLogin.createdAt;
        await usagerRepository.update(
          { uuid: usager.uuid },
          { lastInteraction: usager.lastInteraction }
        );
      }

      const response: PortailUsagerAuthApiResponse = {
        token: access_token,
        profile: portailUsagerProfile,
      };

      return res.status(HttpStatus.OK).json(response);
    } catch (err) {
      return res
        .status(HttpStatus.UNAUTHORIZED)
        .json({ message: err?.message });
    }
  }
}
