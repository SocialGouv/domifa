import { UserStructureProfile, UserStructure } from "@domifa/common";
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
  Query,
  Res,
  UseGuards,
} from "@nestjs/common";
import { AuthGuard } from "@nestjs/passport";
import { ApiBearerAuth, ApiOperation, ApiTags } from "@nestjs/swagger";
import { Response } from "express";
import {
  USER_STRUCTURE_ROLE_ALL,
  UserProfile,
  UserStructureAuthenticated,
} from "../../../_common/model";
import {
  AllowUserStructureRoles,
  CurrentUser,
  CurrentChosenUserStructure,
  AllowUserProfiles,
} from "../../../auth/decorators";
import { AppUserGuard, CanGetUserStructureGuard } from "../../../auth/guards";
import {
  userStructureRepository,
  structureRepository,
  usagerRepository,
} from "../../../database";
import {
  UpdateRoleDto,
  UserEditDto,
  EditMyPasswordDto,
  NewReferrerIdDto,
} from "../dto";
import {
  usersDeletor,
  userStructureCreator,
  userStructureSecurityPasswordUpdater,
} from "../services";
import { userAccountCreatedByAdminEmailSender } from "../../mails/services/templates-renderers";
import { RegisterUserStructureAdminDto } from "../../portail-admin";

const userProfile: UserProfile = "structure";

@Controller("users")
@ApiTags("users")
@AllowUserProfiles("structure")
@AllowUserStructureRoles(...USER_STRUCTURE_ROLE_ALL)
@UseGuards(AuthGuard("jwt"), AppUserGuard)
export class UsersController {
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
  @ApiOperation({
    summary:
      "Réassigner les dossiers d'un utilisateur qu'on souhaite supprimer ou à qui on change les droits, à un autre utilisateur",
  })
  @UseGuards(CanGetUserStructureGuard)
  @Get("reassign-referrers/:userUuid")
  public async reAssignReferrersToAnotherUser(
    @CurrentUser() userStructureAuth: UserStructureAuthenticated,
    @Param("userUuid", new ParseUUIDPipe()) _userUuid: string,
    @Query() query: NewReferrerIdDto,
    @CurrentChosenUserStructure() chosenUserStructure: UserStructure,
    @Res() res: Response
  ) {
    if (query?.newReferrerId) {
      const user = await userStructureRepository.findOneBy({
        id: query.newReferrerId,
        structureId: userStructureAuth.structureId,
      });

      if (!user) {
        return res
          .status(HttpStatus.BAD_REQUEST)
          .json({ message: "USER_NOT_FOUND" });
      }
    }

    await usagerRepository.update(
      { referrerId: chosenUserStructure.id },
      { referrerId: query?.newReferrerId }
    );

    return res.status(HttpStatus.OK).json({ message: "OK" });
  }

  @AllowUserStructureRoles("admin")
  @ApiBearerAuth("Administrateurs")
  @ApiOperation({
    summary: "Compter les dossiers associés à un utilisateur",
  })
  @UseGuards(CanGetUserStructureGuard)
  @Get("count-referrers/:userUuid")
  public async countReferrers(
    @CurrentUser() _userStructureAuth: UserStructureAuthenticated,
    @Param("userUuid", new ParseUUIDPipe()) _userUuid: string,
    @CurrentChosenUserStructure() chosenUserStructure: UserStructure
  ) {
    return usagerRepository
      .createQueryBuilder("usager")
      .where(`usager."referrerId" = :id`, {
        id: chosenUserStructure.id,
      })
      .getCount();
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
      select: {
        uuid: true,
        role: true,
        nom: true,
        prenom: true,
        email: true,
        fonction: true,
        fonctionDetail: true,
      },
    });

    return res.status(HttpStatus.OK).json(userToUpdate);
  }

  @Post("register")
  @AllowUserStructureRoles("admin")
  public async registerUser(
    @CurrentUser() user: UserStructureAuthenticated,
    @Res() res: Response,
    @Body() registerUserDto: RegisterUserStructureAdminDto
  ): Promise<any> {
    const userExist = await userStructureRepository.findOneBy({
      email: registerUserDto.email.toLowerCase(),
    });

    if (userExist) {
      return res
        .status(HttpStatus.BAD_REQUEST)
        .json({ message: "EMAIL_EXIST" });
    }

    if (user._userProfile === "structure") {
      registerUserDto.structureId = user.structureId;
    }

    const { user: newUser, userSecurity } =
      await userStructureCreator.createUserWithTmpToken(registerUserDto);

    if (newUser) {
      return userAccountCreatedByAdminEmailSender
        .sendMail({
          user: newUser,
          token: userSecurity.temporaryTokens.token,
          userProfile,
        })
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
        userProfile,
      });
      return res.status(HttpStatus.OK).json({ message: "OK" });
    } catch (err) {
      return res
        .status(HttpStatus.BAD_REQUEST)
        .json({ message: "EDIT_PASSWORD_FAIL" });
    }
  }
}
