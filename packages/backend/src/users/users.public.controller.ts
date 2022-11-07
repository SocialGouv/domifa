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
  newUserStructureRepository,
  userStructureSecurityResetPasswordInitiator,
  userStructureSecurityResetPasswordUpdater,
} from "../database";
import { userResetPasswordEmailSender } from "../mails/services/templates-renderers";
import { ExpressResponse } from "../util/express";
import { TokenDto } from "../_common/dto";
import { EmailDto } from "./dto/email.dto";
import { ResetPasswordDto } from "./dto/reset-password.dto";

@Controller("users")
@ApiTags("users")
export class UsersPublicController {
  @Post("validate-email")
  public async validateEmail(
    @Body() emailDto: EmailDto,
    @Res() res: ExpressResponse
  ) {
    const existUser = await newUserStructureRepository.findOne({
      where: {
        email: emailDto.email.toLowerCase(),
      },
      select: {
        email: true,
      },
    });

    return res.status(HttpStatus.OK).json(!!existUser);
  }

  @Get("check-password-token/:userId/:token")
  public async checkPasswordToken(
    @Param("userId") userId: string,
    @Param("token") tokenDto: TokenDto,
    @Res() res: ExpressResponse
  ) {
    try {
      await userStructureSecurityResetPasswordUpdater.checkResetPasswordToken({
        token: tokenDto.token,
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
      await userStructureSecurityResetPasswordUpdater.confirmResetPassword({
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
        await userStructureSecurityResetPasswordInitiator.generateResetPasswordToken(
          {
            email: emailDto.email,
          }
        );
      await userResetPasswordEmailSender.sendMail({
        user,
        token: userSecurity.temporaryTokens.token,
      });
    } catch (err) {}
    return res.status(HttpStatus.OK).json({ message: "OK" });
  }
}
