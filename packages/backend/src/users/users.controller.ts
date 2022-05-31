import {
  Body,
  Controller,
  Delete,
  Get,
  HttpStatus,
  Param,
  Patch,
  Post,
  Res,
  UseGuards,
} from "@nestjs/common";
import { AuthGuard } from "@nestjs/passport";
import { ApiBearerAuth, ApiOperation, ApiTags } from "@nestjs/swagger";

import { AllowUserStructureRoles } from "../auth/decorators";
import { CurrentChosenUserStructure } from "../auth/decorators/current-chosen-user-structure.decorator";
import { CurrentUser } from "../auth/decorators/current-user.decorator";
import { AppUserGuard } from "../auth/guards";
import { CanGetUserStructureGuard } from "../auth/guards/CanGetUserStructure.guard";
import {
  userStructureRepository,
  userStructureSecurityPasswordUpdater,
} from "../database";

import { userAccountCreatedByAdminEmailSender } from "../mails/services/templates-renderers/user-account-created-by-admin";

import { ExpressResponse } from "../util/express";
import {
  UserStructure,
  UserStructureAuthenticated,
  UserStructureProfile,
  USER_STRUCTURE_ROLE_ALL,
} from "../_common/model";
import { EditPasswordDto } from "./dto/edit-password.dto";
import { RegisterUserAdminDto } from "./dto/register-user-admin.dto";
import { UpdateRoleDto } from "./dto/update-role.dto";
import { UserEditDto } from "./dto/user-edit.dto";
import { usersDeletor } from "./services";
import { userStructureCreator } from "./services/user-structure-creator.service";

@Controller("users")
@ApiTags("users")
@UseGuards(AuthGuard("jwt"), AppUserGuard)
export class UsersController {
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
      { select: ["passwordLastUpdate"] }
    );
    return res.status(HttpStatus.OK).json(newUser.passwordLastUpdate);
  }

  @AllowUserStructureRoles("admin")
  @ApiBearerAuth("Administrateurs")
  @ApiOperation({ summary: "Editer le rôle d'un utilisateur" })
  @UseGuards(CanGetUserStructureGuard)
  @Patch("update-role/:userId")
  public async updateRole(
    @Body() updateRoleDto: UpdateRoleDto,
    @CurrentUser() userStructureAuth: UserStructureAuthenticated,
    @CurrentChosenUserStructure() chosenUserStructure: UserStructure
  ): Promise<UserStructureProfile> {
    return userStructureRepository.updateOne(
      {
        uuid: chosenUserStructure.uuid,
        structureId: userStructureAuth.structureId,
      },
      { role: updateRoleDto.role }
    );
  }

  @AllowUserStructureRoles("admin")
  @ApiBearerAuth("Administrateurs")
  @ApiOperation({ summary: "Supprimer un utilisateur" })
  @UseGuards(CanGetUserStructureGuard)
  @Delete(":userId")
  public async delete(
    @Param("userId") userId: number,
    @CurrentUser() userStructureAuth: UserStructureAuthenticated,
    @CurrentChosenUserStructure() chosenUserStructure: UserStructure,
    @Res() res: ExpressResponse
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
  @Post("edit-password")
  @AllowUserStructureRoles(...USER_STRUCTURE_ROLE_ALL)
  @ApiOperation({ summary: "Edition du mot de passe depuis le compte user" })
  public async editPassword(
    @CurrentUser() user: UserStructureAuthenticated,
    @Res() res: ExpressResponse,
    @Body() editPasswordDto: EditPasswordDto
  ) {
    try {
      userStructureSecurityPasswordUpdater.updatePassword({
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
