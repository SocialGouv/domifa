import {
  Body,
  Controller,
  Delete,
  Get,
  HttpStatus,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  Res,
  UseGuards,
} from "@nestjs/common";
import { AuthGuard } from "@nestjs/passport";
import { ApiBearerAuth, ApiOperation, ApiTags } from "@nestjs/swagger";

import {
  userStructureRepository,
  structureRepository,
  userStructureSecurityPasswordUpdater,
} from "../../database";

import { Response } from "express";

import {
  UserStructureAuthenticated,
  USER_STRUCTURE_ROLE_ALL,
} from "../../_common/model";

import { usersDeletor } from "../services";
import { userStructureCreator } from "../services/user-structure-creator.service";
import { UserStructureProfile, UserStructure } from "@domifa/common";
import { userAccountCreatedByAdminEmailSender } from "../../modules/mails/services/templates-renderers/user-account-created-by-admin";
import {
  UpdateRoleDto,
  UserEditDto,
  RegisterUserAdminDto,
  EditMyPasswordDto,
} from "../dto";

import {
  AllowUserStructureRoles,
  CurrentUser,
  CurrentChosenUserStructure,
} from "../../auth/decorators";
import { AppUserGuard, CanGetUserStructureGuard } from "../../auth/guards";
@Controller("users")
@ApiTags("users")
@UseGuards(AuthGuard("jwt"), AppUserGuard)
export class UsersController {
  @AllowUserStructureRoles("responsable", "admin")
  @ApiBearerAuth()
  @ApiOperation({ summary: "Liste des utilisateurs" })
  @Get("")
  public async getUsers(
    @CurrentUser() user: UserStructureAuthenticated
  ): Promise<UserStructureProfile[]> {
    const users = await userStructureRepository.getVerifiedUsersByStructureId(
      user.structureId
    );
    if (user.role === "facteur" || user.role === "simple") {
      return users.map((user) => {
        return {
          id: user.id,
          nom: user.nom,
          prenom: user.prenom,
        };
      }) as UserStructureProfile[];
    }
    return users;
  }

  @AllowUserStructureRoles(...USER_STRUCTURE_ROLE_ALL)
  @ApiOperation({ summary: "Accepter les CGU" })
  @Get("accept-terms")
  public async acceptTerms(@CurrentUser() user: UserStructureAuthenticated) {
    await userStructureRepository.update(
      { id: user.id },
      { acceptTerms: new Date() }
    );

    if (user.role === "admin" && !user.structure.acceptTerms) {
      await structureRepository.update(
        { id: user.structureId },
        { acceptTerms: new Date() }
      );
    }
    return true;
  }

  @AllowUserStructureRoles(...USER_STRUCTURE_ROLE_ALL)
  @ApiOperation({ summary: "Edition du mot de passe depuis le compte user" })
  @Get("last-password-update")
  public async getLastPasswordUpdate(
    @CurrentUser() user: UserStructureAuthenticated,
    @Res() res: Response
  ) {
    const newUser = await userStructureRepository.findOne({
      where: { id: user.id },
      select: ["passwordLastUpdate"],
    });

    return res.status(HttpStatus.OK).json(newUser?.passwordLastUpdate ?? null);
  }

  @AllowUserStructureRoles("admin")
  @ApiBearerAuth("Administrateurs")
  @ApiOperation({ summary: "Editer le rôle d'un utilisateur" })
  @UseGuards(CanGetUserStructureGuard)
  @Patch("update-role/:userUuid")
  public async updateRole(
    @Body() updateRoleDto: UpdateRoleDto,
    @CurrentUser() userStructureAuth: UserStructureAuthenticated,
    @Param("userUuid", new ParseUUIDPipe()) _userUuid: string,
    @CurrentChosenUserStructure() chosenUserStructure: UserStructure
  ): Promise<UserStructureProfile> {
    await userStructureRepository.update(
      {
        uuid: chosenUserStructure.uuid,
        structureId: userStructureAuth.structureId,
      },
      { role: updateRoleDto.role }
    );
    return userStructureRepository.findOneBy({
      uuid: chosenUserStructure.uuid,
    });
  }

  @AllowUserStructureRoles("admin")
  @ApiBearerAuth("Administrateurs")
  @ApiOperation({ summary: "Supprimer un utilisateur" })
  @UseGuards(CanGetUserStructureGuard)
  @Delete(":userUuid")
  public async delete(
    @CurrentUser() userStructureAuth: UserStructureAuthenticated,
    @CurrentChosenUserStructure() chosenUserStructure: UserStructure,
    @Param("userUuid", new ParseUUIDPipe()) _userUuid: string,
    @Res() res: Response
  ) {
    await usersDeletor.deleteUser({
      userId: chosenUserStructure.id,
      structureId: userStructureAuth.structureId,
    });

    return res.status(HttpStatus.OK).json({ message: "OK" });
  }

  @AllowUserStructureRoles(...USER_STRUCTURE_ROLE_ALL)
  @Patch()
  public async patch(
    @CurrentUser() user: UserStructureAuthenticated,
    @Body() userDto: UserEditDto,
    @Res() res: Response
  ) {
    await userStructureRepository.update(
      {
        id: user.id,
        structureId: user.structureId,
      },
      userDto
    );

    const userToUpdate = await userStructureRepository.findOne({
      where: { id: user.id },
      select: { uuid: true, role: true, nom: true, prenom: true, email: true },
    });

    return res.status(HttpStatus.OK).json(userToUpdate);
  }

  // Ajout d'utilisateur par un admin
  @Post("register")
  @AllowUserStructureRoles("admin")
  @ApiOperation({ summary: "Ajout d'un utilisateur par un admin" })
  public async registerUser(
    @CurrentUser() user: UserStructureAuthenticated,
    @Res() res: Response,
    @Body() registerUserDto: RegisterUserAdminDto
  ): Promise<any> {
    const userExist = await userStructureRepository.findOneBy({
      email: registerUserDto.email.toLowerCase(),
    });

    if (userExist) {
      return res
        .status(HttpStatus.BAD_REQUEST)
        .json({ message: "EMAIL_EXIST" });
    }

    if (user._userProfile !== "super-admin-domifa") {
      registerUserDto.structureId = user.structureId;
    }

    const { user: newUser, userSecurity } =
      await userStructureCreator.createUserWithTmpToken(registerUserDto);

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
  @Post("edit-my-password")
  @AllowUserStructureRoles(...USER_STRUCTURE_ROLE_ALL)
  @ApiOperation({ summary: "Edition du mot de passe depuis le compte user" })
  public async editPassword(
    @CurrentUser() user: UserStructureAuthenticated,
    @Res() res: Response,
    @Body() editPasswordDto: EditMyPasswordDto
  ) {
    try {
      await userStructureSecurityPasswordUpdater.updatePassword({
        userId: user.id,
        oldPassword: editPasswordDto.oldPassword,
        newPassword: editPasswordDto.password,
      });
      return res.status(HttpStatus.OK).json({ message: "OK" });
    } catch (err) {
      return res
        .status(HttpStatus.BAD_REQUEST)
        .json({ message: "EDIT_PASSWORD_FAIL" });
    }
  }
}
