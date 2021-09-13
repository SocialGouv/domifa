import {
  Body,
  Controller,
  Get,
  HttpStatus,
  Param,
  Post,
  Res,
} from "@nestjs/common";
import { ApiOperation, ApiTags } from "@nestjs/swagger";
import {
  userSecurityResetPasswordInitiator,
  userSecurityResetPasswordUpdater,
  userStructureRepository,
} from "../database";
import { userResetPasswordEmailSender } from "../mails/services/templates-renderers";
import { ExpressResponse } from "../util/express";
import { EmailDto } from "./dto/email.dto";
import { ResetPasswordDto } from "./dto/reset-password.dto";

@Controller("users")
@ApiTags("users")
export class UsersPublicController {
  constructor() {}

  @Post("validate-email")
  public async validateEmail(
    @Body() emailDto: EmailDto,
    @Res() res: ExpressResponse
  ) {
    const existUser = await userStructureRepository.findOne({
      email: emailDto.email.toLowerCase(),
    });

    const emailExist = existUser !== undefined;

    return res.status(HttpStatus.OK).json(emailExist);
  }

  @Get("check-password-token/:userId/:token")
  public async checkPasswordToken(
    @Param("userId") userId: string,
    @Param("token") token: string,
    @Res() res: ExpressResponse
  ) {
    try {
      await userSecurityResetPasswordUpdater.checkResetPasswordToken({
        token,
        userId: parseInt(userId, 10),
      });
      return res.status(HttpStatus.OK).json({ message: "OK" });
    } catch (err) {
      return res
        .status(HttpStatus.BAD_REQUEST)
        .json({ message: "TOKEN_EXPIRED" });
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
      });
      return res.status(HttpStatus.OK).json({ message: "OK" });
    } catch (err) {
      return res
        .status(HttpStatus.BAD_REQUEST)
        .json({ message: "TOKEN_EXPIRED" });
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
        });
      await userResetPasswordEmailSender.sendMail({
        user,
        token: userSecurity.temporaryTokens.token,
      });
    } catch (err) {}
    return res.status(HttpStatus.OK).json({ message: "OK" });
  }
}
