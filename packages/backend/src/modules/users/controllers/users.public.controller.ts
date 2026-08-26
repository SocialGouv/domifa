import {
  Body,
  Controller,
  Get,
  HttpStatus,
  Param,
  ParseIntPipe,
  ParseUUIDPipe,
  Post,
  Req,
  Res,
} from "@nestjs/common";
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
import { UserStructureEmailUpdaterService } from "../services/userStructureEmailUpdater.service";
import { BrevoSenderService } from "../../mails/services/brevo-sender/brevo-sender.service";
import { domifaConfig } from "../../../config";
import { AppLogsService } from "../../app-logs/app-logs.service";
import { buildStructureActorFields } from "../../app-logs/app-logs.helpers";
import { UserStructureEmailChangeLogContext } from "../../app-logs/types/app-log-context.types";
import { redactEmail } from "../../otp/otp.utils";

const userProfile: UserProfile = "structure";

@Controller("users")
export class UsersPublicController {
  constructor(
    private readonly brevoSenderService: BrevoSenderService,
    private readonly appLogService: AppLogsService,
    private readonly userStructureEmailUpdaterService: UserStructureEmailUpdaterService
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
      appLogger.error(err);
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
      appLogger.error(err);
      return res
        .status(HttpStatus.BAD_REQUEST)
        .json({ message: "TOKEN_INVALID" });
    }
  }

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
          userProfile: "structure",
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
    } catch (err) {
      appLogger.error(err);
    }
    return res.status(HttpStatus.OK).json({ message: "OK" });
  }

  // Page de confirmation atteinte via le lien mailé : applique le
  // changement d'email (auto-déclenché au chargement de la page côté front).
  // uuid plutôt que userId : évite d'exposer un identifiant énumérable.
  @Post("confirm-email-update/:uuid/:token")
  public async confirmEmailUpdate(
    @Param("uuid", new ParseUUIDPipe()) uuid: string,
    @Param("token", new ParseTokenPipe()) token: string,
    @Res() res: ExpressResponse
  ) {
    // Try/catch ciblé sur la seule opération qui peut légitimement échouer
    // (token invalide/expiré) : si elle passe, tout ce qui suit (log, mails)
    // n'est plus mappé à TOKEN_INVALID en cas de bug.
    let result;
    try {
      result = await this.userStructureEmailUpdaterService.confirmEmailUpdate({
        uuid,
        token,
      });
    } catch (err) {
      appLogger.error(err);
      return res
        .status(HttpStatus.BAD_REQUEST)
        .json({ message: "TOKEN_INVALID" });
    }

    await this.appLogService.create<UserStructureEmailChangeLogContext>({
      ...buildStructureActorFields(result),
      action: "USER_EMAIL_SELF_UPDATE_CONFIRMED",
      context: {
        oldEmail: redactEmail(result.oldEmail),
        newEmail: redactEmail(result.newEmail),
      },
    });

    // Même template partagé que la demande, motif "confirme" : envoyé aux
    // deux adresses pour que l'ancienne détecte un changement non désiré.
    await Promise.all(
      [result.oldEmail, result.newEmail].map((email) =>
        this.brevoSenderService.sendEmailWithTemplate({
          templateId: domifaConfig().brevo.templates.userEmailUpdated,
          subject: "Votre adresse email DomiFa a été modifiée",
          to: [{ email, name: result.prenom }],
          params: {
            motif: "confirme",
            ancienEmail: result.oldEmail,
            nouvelEmail: result.newEmail,
            prenom: result.prenom,
          },
        })
      )
    );

    return res.status(HttpStatus.OK).json({ message: "OK" });
  }
}
