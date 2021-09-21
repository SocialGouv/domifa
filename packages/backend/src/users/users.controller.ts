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
import { AllowUserStructureRoles, AppUserGuard } from "../auth/guards";
import {
  userSecurityPasswordUpdater,
  userStructureRepository,
} from "../database";
import { userAccountActivatedEmailSender } from "../mails/services/templates-renderers";
import { userAccountCreatedByAdminEmailSender } from "../mails/services/templates-renderers/user-account-created-by-admin";
import { appLogger } from "../util";
import { ExpressResponse } from "../util/express";
import {
  UserStructure,
  UserStructureAuthenticated,
  UserStructureProfile,
  UserStructureRole,
  USER_STRUCTURE_ROLE_ALL,
} from "../_common/model";
import { EditPasswordDto } from "./dto/edit-password.dto";
import { RegisterUserAdminDto } from "./dto/register-user-admin.dto";
import { UserEditDto } from "./dto/user-edit.dto";
import { usersCreator, usersDeletor } from "./services";

@Controller("users")
@ApiTags("users")
@UseGuards(AuthGuard("jwt"), AppUserGuard)
export class UsersController {
  constructor() {}

  @AllowUserStructureRoles("responsable", "admin")
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

  @AllowUserStructureRoles(...USER_STRUCTURE_ROLE_ALL)
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
  @AllowUserStructureRoles("admin")
  public getUsersToConfirm(
    @CurrentUser() user: UserStructureAuthenticated
  ): Promise<UserStructureProfile[]> {
    return userStructureRepository.findMany({
      structureId: user.structureId,
      verified: false,
    });
  }

  @AllowUserStructureRoles("admin")
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

  @AllowUserStructureRoles("admin")
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

  @AllowUserStructureRoles("admin")
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

  @AllowUserStructureRoles(...USER_STRUCTURE_ROLE_ALL)
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

  // Ajout d'utilisateur par un admin
  @Post("register")
  @AllowUserStructureRoles("admin")
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
  @AllowUserStructureRoles(...USER_STRUCTURE_ROLE_ALL)
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
