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
import { ParseTokenPipe } from "../../_common/decorators";
import {
  userStructureRepository,
  userStructureSecurityResetPasswordUpdater,
  userStructureSecurityResetPasswordInitiator,
} from "../../database";
import { userResetPasswordEmailSender } from "../../mails/services/templates-renderers";
import { ExpressResponse } from "../../util";
import { EmailDto, ResetPasswordDto } from "../dto";

@Controller("users")
@ApiTags("users")
export class UsersPublicController {
  @Post("validate-email")
  public async validateEmail(
    @Body() emailDto: EmailDto,
    @Res() res: ExpressResponse
  ) {
    const existUser = await userStructureRepository.findOne({
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
    @Param("userId", new ParseIntPipe()) userId: number,
    @Param("token", new ParseTokenPipe()) token: string,
    @Res() res: ExpressResponse
  ) {
    try {
      await userStructureSecurityResetPasswordUpdater.checkResetPasswordToken({
        token,
        userId: userId,
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
      await userStructureSecurityResetPasswordUpdater.confirmResetPassword({
        newPassword: resetPasswordDto.password,
        token: resetPasswordDto.token,
        userId: resetPasswordDto.userId,
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
