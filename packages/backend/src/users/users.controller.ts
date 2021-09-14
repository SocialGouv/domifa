import {
  Body,
  Controller,
  Delete,
  Get,
  HttpException,
  HttpStatus,
  Param,
  Patch,
  Post,
  Res,
  UseGuards,
} from "@nestjs/common";
import { AuthGuard } from "@nestjs/passport";
import { ApiBearerAuth, ApiOperation, ApiTags } from "@nestjs/swagger";
import { AxiosError } from "axios";
import { CurrentUser } from "../auth/current-user.decorator";
import { AdminGuard } from "../auth/guards/admin.guard";
import { ResponsableGuard } from "../auth/guards/responsable.guard";
import {
  userSecurityPasswordUpdater,
  userSecurityResetPasswordInitiator,
  userSecurityResetPasswordUpdater,
  userStructureRepository,
} from "../database";
import {
  userAccountActivatedEmailSender,
  userResetPasswordEmailSender,
} from "../mails/services/templates-renderers";
import { userAccountCreatedByAdminEmailSender } from "../mails/services/templates-renderers/user-account-created-by-admin";
import { StructuresService } from "../structures/services/structures.service";
import { appLogger } from "../util";
import { ExpressResponse } from "../util/express";
import {
  UserStructure,
  UserStructureAuthenticated,
  UserStructureProfile,
  UserStructureRole,
} from "../_common/model";
import { EditPasswordDto } from "./dto/edit-password.dto";
import { EmailDto } from "./dto/email.dto";
import { RegisterUserAdminDto } from "./dto/register-user-admin.dto";
import { ResetPasswordDto } from "./dto/reset-password.dto";
import { UserEditDto } from "./dto/user-edit.dto";
import { usersCreator, usersDeletor } from "./services";

@Controller("users")
@ApiTags("users")
export class UsersController {
  constructor(private structureService: StructuresService) {}

  @UseGuards(AuthGuard("jwt"), ResponsableGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: "Liste des utilisateurs" })
  @Get("")
  public getUsers(
    @CurrentUser() user: UserStructureAuthenticated
  ): Promise<UserStructureProfile[]> {
    return userStructureRepository.findMany({
      structureId: user.structureId,
      verified: true,
    });
  }

  @UseGuards(AuthGuard("jwt"))
  @ApiOperation({ summary: "Edition du mot de passe depuis le compte user" })
  @Get("last-password-update")
  public async getLastPasswordUpdate(
    @CurrentUser() user: UserStructureAuthenticated,
    @Res() res: ExpressResponse
  ) {
    const newUser = await userStructureRepository.findOne<UserStructure>(
      { id: user.id },
      { select: "ALL" }
    );
    return res.status(HttpStatus.OK).json(newUser.passwordLastUpdate);
  }

  @Get("to-confirm")
  @ApiBearerAuth("Administrateurs")
  @ApiOperation({ summary: "Liste des utilisateurs à confirmer" })
  @UseGuards(AuthGuard("jwt"), AdminGuard)
  public getUsersToConfirm(
    @CurrentUser() user: UserStructureAuthenticated
  ): Promise<UserStructureProfile[]> {
    return userStructureRepository.findMany({
      structureId: user.structureId,
      verified: false,
    });
  }

  @UseGuards(AuthGuard("jwt"), AdminGuard)
  @ApiBearerAuth("Administrateurs")
  @ApiOperation({ summary: "Confirmer une création de compte" })
  @Get("confirm/:id")
  public async confirmUser(
    @Param("id") id: number,
    @CurrentUser() user: UserStructureAuthenticated,
    @Res() res: ExpressResponse
  ) {
    const confirmerUser = await userStructureRepository.updateOne(
      { id, structureId: user.structureId },
      { verified: true }
    );

    if (confirmerUser && confirmerUser !== undefined) {
      return userAccountActivatedEmailSender
        .sendMail({ user: confirmerUser })
        .then(
          () => {
            return res.status(HttpStatus.OK).json(confirmerUser);
          },
          (error: AxiosError) => {
            appLogger.warn(`[UsersMail] mail user account activated failed`);
            appLogger.error(JSON.stringify(error.message));
            throw new HttpException(
              "USER_ACCOUNT_ACTIVATED",
              HttpStatus.INTERNAL_SERVER_ERROR
            );
          }
        );
    } else {
      throw new HttpException(
        "INVALID_CONFIRM_TOKEN",
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  @UseGuards(AuthGuard("jwt"), AdminGuard)
  @ApiBearerAuth("Administrateurs")
  @ApiOperation({ summary: "Editer le rôle d'un utilisateur" })
  @Get("update-role/:id/:role")
  public async updateRole(
    @Param("id") id: number,
    @Param("role") role: UserStructureRole,
    @CurrentUser() user: UserStructureAuthenticated
  ): Promise<UserStructureProfile> {
    if (
      role !== "simple" &&
      role !== "admin" &&
      role !== "facteur" &&
      role !== "responsable"
    ) {
      throw new HttpException("BAD_REQUEST", HttpStatus.INTERNAL_SERVER_ERROR);
    }

    if (id === user.id) {
      throw new HttpException("BAD_REQUEST", HttpStatus.INTERNAL_SERVER_ERROR);
    }

    return userStructureRepository.updateOne(
      {
        id,
        structureId: user.structureId,
      },
      {
        role,
      }
    );
  }

  @UseGuards(AuthGuard("jwt"), AdminGuard)
  @ApiBearerAuth("Administrateurs")
  @ApiOperation({ summary: "Supprimer un utilisateur" })
  @Delete(":id")
  public async delete(
    @Param("id") id: number,
    @CurrentUser() user: UserStructureAuthenticated,
    @Res() res: ExpressResponse
  ) {
    const userToDelete = await userStructureRepository.findOne({
      id,
      structureId: user.structureId,
    });

    if (!userToDelete) {
      return res
        .status(HttpStatus.BAD_REQUEST)
        .json({ message: "BAD_REQUEST" });
    }

    const retour = await usersDeletor.deleteUser({
      userId: userToDelete.id,
      structureId: user.structureId,
    });

    return res.status(HttpStatus.OK).json({ success: true, message: retour });
  }

  @UseGuards(AuthGuard("jwt"))
  @Patch()
  public async patch(
    @CurrentUser() user: UserStructureAuthenticated,
    @Body() userDto: UserEditDto,
    @Res() res: ExpressResponse
  ) {
    const userToUpdate = await userStructureRepository.updateOne(
      {
        id: user.id,
        structureId: user.structureId,
      },
      userDto
    );

    if (!userToUpdate) {
      return res
        .status(HttpStatus.BAD_REQUEST)
        .json({ message: "USER_EDIT_FAIL" });
    }
    return res.status(HttpStatus.OK).json(userToUpdate);
  }

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

  // Ajout d'utilisateur par un admin
  @Post("register")
  @UseGuards(AuthGuard("jwt"), AdminGuard)
  @ApiOperation({ summary: "Ajout d'un utilisateur par un admin" })
  public async registerUser(
    @CurrentUser() user: UserStructureAuthenticated,
    @Res() res: ExpressResponse,
    @Body() registerUserDto: RegisterUserAdminDto
  ): Promise<any> {
    const userExist = await userStructureRepository.findOne({
      email: registerUserDto.email.toLowerCase(),
    });
    if (userExist) {
      return res
        .status(HttpStatus.BAD_REQUEST)
        .json({ message: "EMAIL_EXIST" });
    }

    registerUserDto.structureId = user.structureId;
    registerUserDto.structure = user.structure;

    const { user: newUser, userSecurity } =
      await usersCreator.createUserWithTmpToken(registerUserDto);

    if (newUser) {
      return userAccountCreatedByAdminEmailSender
        .sendMail({ user: newUser, token: userSecurity.temporaryTokens.token })
        .then(
          () => {
            return res.status(HttpStatus.OK).json({ message: "OK" });
          },
          () => {
            return res
              .status(HttpStatus.INTERNAL_SERVER_ERROR)
              .json({ message: "REGISTER_ERROR" });
          }
        );
    }
    return res
      .status(HttpStatus.INTERNAL_SERVER_ERROR)
      .json({ message: "REGISTER_ERROR" });
  }

  // Edition d'un mot de passe quand on est déjà connecté
  @Post("edit-password")
  @UseGuards(AuthGuard("jwt"))
  @ApiOperation({ summary: "Edition du mot de passe depuis le compte user" })
  public async editPassword(
    @CurrentUser() user: UserStructureAuthenticated,
    @Res() res: ExpressResponse,
    @Body() editPasswordDto: EditPasswordDto
  ) {
    try {
      userSecurityPasswordUpdater.updatePassword({
        userId: user.id,
        oldPassword: editPasswordDto.oldPassword,
        newPassword: editPasswordDto.password,
      });
      return res.status(HttpStatus.OK).json({ message: "OK" });
    } catch (err) {
      return res
        .status(HttpStatus.INTERNAL_SERVER_ERROR)
        .json({ message: "L'ancien mot de passe est incorrect" });
    }
  }
}
