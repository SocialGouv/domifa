import {
  UserStructureProfile,
  UserStructure,
  ALL_USER_STRUCTURE_ROLES,
} from "@domifa/common";
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
  UserAdminAuthenticated,
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
import { RegisterUserStructureAdminDto } from "../../portail-admin";
import { AppLogsService } from "../../app-logs/app-logs.service";
import {
  UserStructureCreateLogContext,
  UserStructureRoleChangeLogContext,
} from "../../app-logs/types/app-log-context.types";
import { appLogger } from "../../../util";
import { BrevoSenderService } from "../../mails/services/brevo-sender/brevo-sender.service";

const userProfile: UserProfile = "structure";

@Controller("users")
@ApiTags("users")
@AllowUserProfiles("structure")
@AllowUserStructureRoles(...ALL_USER_STRUCTURE_ROLES)
@UseGuards(AuthGuard("jwt"), AppUserGuard)
export class UsersController {
  constructor(
    private readonly appLogService: AppLogsService,
    private readonly brevoSenderService: BrevoSenderService
  ) {}

  @Get("")
  public async getUsers(
    @CurrentUser() user: UserStructureAuthenticated
  ): Promise<UserStructureProfile[]> {
    const users = await userStructureRepository.getVerifiedUsersByStructureId(
      user.structureId
    );
    if (
      user.role === "facteur" ||
      user.role === "agent" ||
      user.role === "simple"
    ) {
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
    await this.appLogService.create<UserStructureRoleChangeLogContext>({
      action: "USER_ROLE_CHANGE",
      userId: userStructureAuth.id,
      role: userStructureAuth.role,
      context: {
        newRole: updateRoleDto.role,
        oldRole: chosenUserStructure.role,
        userId: chosenUserStructure.id,
        structureId: chosenUserStructure.structureId,
      },
    });
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
    const userEmail = chosenUserStructure.email;

    await usersDeletor.deleteUser({
      userId: chosenUserStructure.id,
      structureId: userStructureAuth.structureId,
    });

    try {
      await this.brevoSenderService.deleteContactFromBrevo(userEmail);
    } catch (error) {
      appLogger.warn(
        `Échec de la suppression du contact Brevo pour ${userEmail}`,
        error
      );
    }

    await this.appLogService.create<UserStructureCreateLogContext>({
      action: "USER_DELETE",
      userId: userStructureAuth._userId,
      role: userStructureAuth.role,
      structureId: userStructureAuth.structureId,
      context: {
        role: chosenUserStructure.role,
        userId: chosenUserStructure.id,
        structureId: userStructureAuth.structureId,
      },
    });

    return res.status(HttpStatus.OK).json({ message: "OK" });
  }

  @Patch()
  @ApiOperation({ summary: "Modifier mes informations" })
  public async patch(
    @CurrentUser() user: UserStructureAuthenticated,
    @Body() userDto: UserEditDto,
    @Res() res: Response
  ) {
    if (userDto.email !== user.email) {
      const userExist = await userStructureRepository.findOneBy({
        email: userDto.email.toLowerCase(),
      });

      if (userExist) {
        return res
          .status(HttpStatus.BAD_REQUEST)
          .json({ message: "BAD_REQUEST" });
      }
    }

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
    @CurrentUser() user: UserStructureAuthenticated | UserAdminAuthenticated, // workaround : this controller is called in another controller
    @Res() res: Response,
    @Body() registerUserDto: RegisterUserStructureAdminDto
  ): Promise<any> {
    const userExist = await userStructureRepository.findOneBy({
      email: registerUserDto.email.toLowerCase(),
    });

    if (userExist) {
      return res
        .status(HttpStatus.BAD_REQUEST)
        .json({ message: "BAD_REQUEST" });
    }

    if (user._userProfile === "structure") {
      registerUserDto.structureId = user.structureId;
    }

    const { user: newUser, userSecurity } =
      await userStructureCreator.createUserWithTmpToken(registerUserDto);

    if (!newUser) {
      return res
        .status(HttpStatus.INTERNAL_SERVER_ERROR)
        .json({ message: "REGISTER_ERROR" });
    }

    // Envoi de l'email d'activation avec génération automatique du lien
    await this.brevoSenderService.sendUserActivationEmail({
      userId: newUser.id,
      userProfile,
      userSecurity,
    });

    await this.appLogService.create<UserStructureCreateLogContext>({
      action: "USER_CREATE",
      userId: user.id,
      structureId: "structureId" in user ? user.structureId : null,
      role: user.role,
      context: {
        role: newUser.role,
        userId: newUser.id,
        structureId: newUser.structureId,
      },
    });

    try {
      const userWithStructure =
        await userStructureRepository.getUserWithStructureByIdForSync(
          newUser.id
        );
      if (userWithStructure) {
        await this.brevoSenderService.syncContactToBrevo(userWithStructure);
      }
    } catch (error) {
      appLogger.warn(
        `Échec de la synchronisation Brevo pour l'utilisateur ${newUser.id}`,
        error
      );
    }

    return res.status(HttpStatus.OK).json({ message: "OK" });
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
      appLogger.error(err);
      return res
        .status(HttpStatus.BAD_REQUEST)
        .json({ message: "EDIT_PASSWORD_FAIL" });
    }
  }
}
