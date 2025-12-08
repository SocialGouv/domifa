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
import { UserProfile } from "../../../_common/model";
import {
  userSecurityResetPasswordInitiator,
  userSecurityResetPasswordUpdater,
} from "../services";
import { BrevoSenderService } from "../../mails/services/brevo-sender/brevo-sender.service";
import { domifaConfig } from "../../../config";

const userProfile: UserProfile = "structure";

@Controller("users")
@ApiTags("users")
export class UsersPublicController {
  constructor(private readonly brevoSenderService: BrevoSenderService) {}
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
      appLogger.error(err);
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
      appLogger.error(err);
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
      const { user, userSecurity } =
        await userSecurityResetPasswordInitiator.generateResetPasswordToken({
          email: emailDto.email,
          userProfile: "structure",
        });

      const link = userSecurityResetPasswordInitiator.buildResetPasswordLink({
        token: userSecurity.temporaryTokens.token,
        userId: user.id,
        userProfile,
      });

      await this.brevoSenderService.sendEmailWithTemplate({
        templateId: domifaConfig().brevo.templates.userResetPassword,
        subject: "Réinitialisation de mot de passe",
        to: [
          {
            email: user.email,
            name: `${user.prenom} ${user.nom}`,
          },
        ],
        params: { lien: link, prenom: user.prenom },
      });
    } catch (err) {
      appLogger.error(err);
    }
    return res.status(HttpStatus.OK).json({ message: "OK" });
  }
}
