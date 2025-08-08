import {
  Body,
  Controller,
  Get,
  HttpStatus,
  Param,
  ParseIntPipe,
  Post,
  Res,
} from "@nestjs/common";
import { ApiOperation, ApiTags } from "@nestjs/swagger";
import { ParseTokenPipe } from "../../../_common/decorators";
import { appLogger, ExpressResponse } from "../../../util";
import { EmailDto, ResetPasswordDto } from "../dto";
import { userResetPasswordEmailSender } from "../../mails/services/templates-renderers";
import { UserProfile } from "../../../_common/model";
import {
  userSecurityResetPasswordInitiator,
  userSecurityResetPasswordUpdater,
} from "../services";
import { AppLogsService } from "../../app-logs/app-logs.service";
import { StructureUserCrudLogContext } from "../../app-logs/app-log-context.types";
import {
  userStructureRepository,
  userSupervisorRepository,
} from "../../../database";

const userProfile: UserProfile = "supervisor";

@Controller("users-supervisor")
@ApiTags("users-supervisor")
export class UsersSupervisorController {
  constructor(private readonly appLogservice: AppLogsService) {}
  @Get("check-password-token/:userId/:token")
  public async checkPasswordToken(
    @Param("userId", new ParseIntPipe()) userId: number,
    @Param("token", new ParseTokenPipe()) token: string,
    @Res() res: ExpressResponse
  ) {
    try {
      await userSecurityResetPasswordUpdater.checkResetPasswordToken({
        token,
        userId,
        userProfile,
      });
      return res.status(HttpStatus.OK).json({ message: "OK" });
    } catch (err) {
      return res
        .status(HttpStatus.BAD_REQUEST)
        .json({ message: "TOKEN_INVALID" });
    }
  }

  @Post("reset-password")
  public async resetPassword(
    @Body() resetPasswordDto: ResetPasswordDto,
    @Res() res: ExpressResponse
  ) {
    try {
      await userSecurityResetPasswordUpdater.confirmResetPassword({
        newPassword: resetPasswordDto.password,
        token: resetPasswordDto.token,
        userId: resetPasswordDto.userId,
        userProfile,
      });
      return res.status(HttpStatus.OK).json({ message: "OK" });
    } catch (err) {
      return res
        .status(HttpStatus.BAD_REQUEST)
        .json({ message: "TOKEN_INVALID" });
    }
  }

  @ApiOperation({ summary: "Reset du mot de passe : envoi du lien par mail" })
  @Post("get-password-token")
  public async generatePasswordToken(
    @Body() emailDto: EmailDto,
    @Res() res: ExpressResponse
  ) {
    try {
      const userSuperviseur = await userSupervisorRepository.findOneByOrFail({
        email: emailDto.email,
      });
      const updateUser = await userStructureRepository.findOneByOrFail({
        email: emailDto.email,
      });
      const { user, userSecurity } =
        await userSecurityResetPasswordInitiator.generateResetPasswordToken({
          email: emailDto.email,
          userProfile,
        });
      await userResetPasswordEmailSender.sendMail({
        user,
        token: userSecurity.temporaryTokens.token,
        userProfile,
      }),
        await this.appLogservice.create<StructureUserCrudLogContext>({
          action: "ADMIN_PASSWORD_RESET",
          userId: userSuperviseur.id,
          context: {
            userId: updateUser.id,
            role: updateUser.role,
          },
        });
    } catch (err) {
      appLogger.error("Cannot reset password");
    }

    return res.status(HttpStatus.OK).json({ message: "OK" });
  }
}
