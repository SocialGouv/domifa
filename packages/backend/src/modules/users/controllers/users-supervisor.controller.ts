import {
  Body,
  Controller,
  Get,
  HttpStatus,
  Param,
  ParseIntPipe,
  Post,
  Req,
  Res,
} from "@nestjs/common";
import { ApiOperation, ApiTags } from "@nestjs/swagger";
import { Request as ExpressRequest } from "express";
import { ParseTokenPipe } from "../../../_common/decorators";
import { appLogger, ExpressResponse } from "../../../util";
import { buildSecurityLogRequestContext } from "../../../util/express";
import { EmailDto, ResetPasswordDto } from "../dto";
import { UserProfile } from "../../../_common/model";
import {
  userSecurityResetPasswordInitiator,
  userSecurityResetPasswordUpdater,
} from "../services";
import { AppLogsService } from "../../app-logs/app-logs.service";
import { UserSupervisorCrudLogContext } from "../../app-logs/types/app-log-context.types";
import { BrevoSenderService } from "../../mails/services/brevo-sender/brevo-sender.service";
import { domifaConfig } from "../../../config";

const userProfile: UserProfile = "supervisor";

@Controller("users-supervisor")
@ApiTags("users-supervisor")
export class UsersSupervisorController {
  constructor(
    private readonly brevoSenderService: BrevoSenderService,
    private readonly appLogservice: AppLogsService
  ) {}

  @Get("check-password-token/:userId/:token")
  public async checkPasswordToken(
    @Req() req: ExpressRequest,
    @Param("userId", new ParseIntPipe()) userId: number,
    @Param("token", new ParseTokenPipe()) token: string,
    @Res() res: ExpressResponse
  ) {
    try {
      await userSecurityResetPasswordUpdater.checkResetPasswordToken({
        token,
        userId,
        userProfile,
        requestContext: buildSecurityLogRequestContext(req),
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
    @Req() req: ExpressRequest,
    @Body() resetPasswordDto: ResetPasswordDto,
    @Res() res: ExpressResponse
  ) {
    try {
      await userSecurityResetPasswordUpdater.confirmResetPassword({
        newPassword: resetPasswordDto.password,
        token: resetPasswordDto.token,
        userId: resetPasswordDto.userId,
        userProfile,
        requestContext: buildSecurityLogRequestContext(req),
      });
      return res.status(HttpStatus.OK).json({ message: "OK" });
    } catch (err) {
      return res
        .status(HttpStatus.BAD_REQUEST)
        .json({ message: "TOKEN_INVALID" });
    }
  }

  @ApiOperation({
    summary: "Reset du mot de passe d'un: envoi du lien par mail",
  })
  @Post("get-password-token")
  public async generatePasswordToken(
    @Req() req: ExpressRequest,
    @Body() emailDto: EmailDto,
    @Res() res: ExpressResponse
  ) {
    try {
      const { user, resetLink: link } =
        await userSecurityResetPasswordInitiator.generateResetPasswordToken({
          email: emailDto.email,
          userProfile,
          requestContext: buildSecurityLogRequestContext(req),
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

      await this.appLogservice.create<UserSupervisorCrudLogContext>({
        userType: "user_supervisor",
        action: "ADMIN_PASSWORD_RESET",
        userId: user.id,
      });
    } catch (err) {
      appLogger.error("Cannot reset password");
    }

    return res.status(HttpStatus.OK).json({ message: "OK" });
  }
}
