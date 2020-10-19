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
  Response,
  UseGuards,
} from "@nestjs/common";
import { AuthGuard } from "@nestjs/passport";
import { CurrentUser } from "../auth/current-user.decorator";
import { AdminGuard } from "../auth/guards/admin.guard";

import { MailJetService } from "./services/mailjet.service";
import { StructuresService } from "../structures/services/structures.service";
import { DomifaMailsService } from "../mails/services/domifa-mails.service";
import { UsersService } from "./services/users.service";
import { UsersMailsService } from "../mails/services/users-mails.service";

import * as bcrypt from "bcryptjs";
import { AxiosResponse, AxiosError } from "axios";
import { ApiBearerAuth, ApiOperation, ApiTags } from "@nestjs/swagger";

import { User } from "./user.interface";

import { EmailDto } from "./dto/email.dto";
import { ResetPasswordDto } from "./dto/reset-password.dto";
import { UserEditDto } from "./dto/user-edit.dto";
import { UserDto } from "./dto/user.dto";
import { RegisterUserAdminDto } from "./dto/register-user-admin.dto";
import { EditPasswordDto } from "./dto/edit-password.dto";

import { UserRole } from "./user-role.type";
import { appLogger } from "../util";

@Controller("users")
@ApiTags("users")
export class UsersController {
  constructor(
    private readonly usersService: UsersService,
    private readonly domifaMailsService: DomifaMailsService,
    private readonly usersMailsService: UsersMailsService,
    private readonly structureService: StructuresService,
    private readonly mailjetService: MailJetService
  ) {}

  @UseGuards(AuthGuard("jwt"))
  @ApiBearerAuth()
  @ApiOperation({ summary: "Liste des utilisateurs" })
  @Get("")
  public getUsers(@CurrentUser() user: User): Promise<User[]> {
    return this.usersService.findAll({
      structureId: user.structureId,
      verified: true,
    });
  }

  @Get("to-confirm")
  @ApiBearerAuth("Administrateurs")
  @ApiOperation({ summary: "Liste des utilisateurs à confirmer" })
  @UseGuards(AuthGuard("jwt"), AdminGuard)
  public getUsersToConfirm(@CurrentUser() user: User): Promise<User[]> {
    return this.usersService.findAll({
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
    @CurrentUser() user: User,
    @Response() res: any
  ) {
    const confirmerUser = await this.usersService.update(id, user.structureId, {
      verified: true,
    });

    if (confirmerUser && confirmerUser !== null) {
      this.usersMailsService.accountActivated(confirmerUser).then(
        (result: AxiosResponse) => {
          if (result.status !== 200) {
            appLogger.warn(`[UsersMail] mail user account activated failed`);
            appLogger.error(JSON.stringify(result.data));

            throw new HttpException(
              "TIPIMAIL_USER_ACCOUNT_ACTIVATED",
              HttpStatus.INTERNAL_SERVER_ERROR
            );
          } else {
            return res.status(HttpStatus.OK).json({ message: "OK" });
          }
        },
        (error: AxiosError) => {
          appLogger.warn(`[UsersMail] mail user account activated failed`);
          appLogger.error(JSON.stringify(error.message));
          throw new HttpException(
            "TIPIMAIL_USER_ACCOUNT_ACTIVATED",
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
    @Param("role") role: UserRole,
    @CurrentUser() user: User
  ) {
    if (
      role !== "simple" &&
      role !== "admin" &&
      role !== "facteur" &&
      role !== "responsable"
    ) {
      throw new HttpException(
        "ROLE_INCORRECT",
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }

    if (id === user.id) {
      throw new HttpException(
        "CANNOT_UPDATE_SELF_ROLE",
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }

    return this.usersService.update(id, user.structureId, {
      role,
    });
  }

  @UseGuards(AuthGuard("jwt"), AdminGuard)
  @ApiBearerAuth("Administrateurs")
  @ApiOperation({ summary: "Supprimer un utilisateur" })
  @Delete(":id")
  public async delete(
    @Param("id") id: number,
    @CurrentUser() user: User,
    @Response() res: any
  ) {
    const userToDelete = await this.usersService.findOne({
      id,
      structureId: user.structureId,
    });

    if (!userToDelete || userToDelete === null) {
      return res
        .status(HttpStatus.BAD_REQUEST)
        .json({ message: "USER_TO_DELETE_NOT_EXIST" });
    }

    const retour = await this.usersService.delete(userToDelete._id);

    return res.status(HttpStatus.OK).json({ success: true, message: retour });
  }

  @UseGuards(AuthGuard("jwt"))
  @Patch()
  public async patch(
    @CurrentUser() user: User,
    @Body() userDto: UserEditDto,
    @Response() res: any
  ) {
    const userToUpdate = await this.usersService.update(
      user.id,
      user.structureId,
      userDto
    );

    if (!userToUpdate || userToUpdate === null) {
      return res
        .status(HttpStatus.BAD_REQUEST)
        .json({ message: "USER_EDIT_FAIL" });
    }
    return res.status(HttpStatus.OK).json(userToUpdate);
  }

  @Post()
  public async create(@Body() userDto: UserDto, @Response() res: any) {
    const user = await this.usersService.findOne({ email: userDto.email });

    if (user) {
      return res
        .status(HttpStatus.BAD_REQUEST)
        .json({ message: "EMAIL_EXIST" });
    }

    const structure = await this.structureService.findOne(userDto.structureId);

    if (!structure || structure === null) {
      return res
        .status(HttpStatus.BAD_REQUEST)
        .json({ message: "STRUCTURE_NOT_EXIST" });
    }

    const newUser = await this.usersService.create(userDto, structure);

    if (newUser && newUser !== null) {
      this.structureService.addUser(newUser, userDto.structureId);
      delete newUser.password;

      if (newUser.role === "admin") {
        //
        // Mail vers Domifa pour indiquer une création de structure
        //
        this.domifaMailsService.newStructure(structure, newUser).then(
          (result: AxiosResponse) => {
            if (result.status !== 200) {
              appLogger.warn(
                `[StructuresMail] mail new structure for domifa failed`
              );
              appLogger.error(JSON.stringify(result.data));

              throw new HttpException(
                "TIPIMAIL_NEW_STRUCTURE_ERROR",
                HttpStatus.INTERNAL_SERVER_ERROR
              );
            } else {
              return res.status(HttpStatus.OK).json(newUser);
            }
          },
          (error: AxiosError) => {
            appLogger.warn(
              `[StructuresMail] mail new structure for domifa failed`
            );
            appLogger.error(JSON.stringify(error.message));
            throw new HttpException(
              "TIPIMAIL_NEW_STRUCTURE_ERROR",
              HttpStatus.INTERNAL_SERVER_ERROR
            );
          }
        );
        //
      } else {
        //
        //
        //

        const admin = await this.usersService.findOne({
          role: "admin",
          structureId: newUser.structureId,
        });

        //  this.mailjetService.newUser(admin, newUser);
      }

      return res.status(HttpStatus.OK).json(newUser);
    }

    throw new HttpException("INTERNAL_ERROR", HttpStatus.INTERNAL_SERVER_ERROR);
  }

  @Post("validate-email")
  public async validateEmail(@Body() emailDto: EmailDto, @Response() res: any) {
    const existUser = await this.usersService.findOne({
      email: emailDto.email,
    });

    const emailExist = existUser !== null;

    return res.status(HttpStatus.OK).json(emailExist);
  }

  @Get("check-password-token/:token")
  public async checkPasswordToken(@Param("token") token: string) {
    const today = new Date();
    const existUser = await this.usersService.findOne({
      "tokens.password": token,
    });

    if (!existUser || existUser === null) {
      throw new HttpException("CHECK_PASSWORD_TOKEN", HttpStatus.BAD_REQUEST);
    }
    if (existUser.tokens.passwordValidity < today) {
      throw new HttpException("TOKEN_EXPIRED", HttpStatus.BAD_REQUEST);
    }
    return existUser;
  }

  @Post("reset-password")
  public async resetPassword(
    @Body() resetPasswordDto: ResetPasswordDto,
    @Response() res: any
  ) {
    const today = new Date();
    const existUser = await this.usersService.findOne({
      "tokens.password": resetPasswordDto.token,
    });

    if (!existUser || existUser === null) {
      return res
        .status(HttpStatus.BAD_REQUEST)
        .json({ message: "RESET_PASSWORD" });
    }
    if (existUser.tokens.passwordValidity < today) {
      return res
        .status(HttpStatus.BAD_REQUEST)
        .json({ message: "TOKEN_EXPIRED" });
    }

    this.usersService.updatePassword(resetPasswordDto).then(
      (user) => {
        return res.status(HttpStatus.OK).json({ message: "OK" });
      },
      (error) => {
        return res
          .status(HttpStatus.INTERNAL_SERVER_ERROR)
          .json({ message: "UPDATE_RESET_PASSWORD" });
      }
    );
  }

  @ApiOperation({ summary: "Reset du mot de passe : envoi du lien par mail" })
  @Post("get-password-token")
  public async generatePasswordToken(
    @Body() emailDto: EmailDto,
    @Response() res: any
  ) {
    const user = await this.usersService.findOne({ email: emailDto.email });
    if (!user) {
      return res
        .status(HttpStatus.BAD_REQUEST)
        .json({ message: "RESET_EMAIL_NOT_EXIST" });
    } else {
      const updatedUser = await this.usersService.generateTokenPassword(
        emailDto.email
      );

      if (updatedUser && updatedUser !== null) {
        this.usersMailsService.newPassword(updatedUser).then(
          (result) => {
            return res.status(HttpStatus.OK).json({ message: "OK" });
          },
          (error) => {
            return res
              .status(HttpStatus.INTERNAL_SERVER_ERROR)
              .json({ message: "MAIL_NEW_PASSWORD_ERROR" });
          }
        );
      } else {
        return res
          .status(HttpStatus.INTERNAL_SERVER_ERROR)
          .json({ message: "RESET_PASSWORD_IMPOSSIBLE" });
      }
    }
  }

  // Ajout d'utilisateur par un admin
  @Post("register")
  @UseGuards(AuthGuard("jwt"), AdminGuard)
  @ApiOperation({ summary: "Ajout d'un utilisateur par un admin" })
  public async registerUser(
    @CurrentUser() user: User,
    @Response() res: any,
    @Body() registerUserDto: RegisterUserAdminDto
  ): Promise<boolean> {
    const userExist = await this.usersService.findOne({
      email: registerUserDto.email,
    });

    if (userExist) {
      return res
        .status(HttpStatus.BAD_REQUEST)
        .json({ message: "EMAIL_EXIST" });
    }

    registerUserDto.structureId = user.structureId;
    registerUserDto.structure = user.structure;

    const newUser = await this.usersService.register(registerUserDto);

    const updatedUser = await this.usersService.generateTokenPassword(
      newUser.email
    );

    if (updatedUser && updatedUser !== null) {
      this.usersMailsService.newUserFromAdmin(updatedUser).then(
        (result) => {
          return res.status(HttpStatus.OK).json({ message: "OK" });
        },
        (error) => {
          return res
            .status(HttpStatus.INTERNAL_SERVER_ERROR)
            .json({ message: "REGISTER_ERROR" });
        }
      );
    } else {
      return false;
    }
    return true;
  }

  // Edition d'un mot de passe quand on est déjà connecté
  @Post("edit-password")
  @UseGuards(AuthGuard("jwt"))
  @ApiOperation({ summary: "Edition du mot de passe depuis le compte user" })
  public async editPassword(
    @CurrentUser() user: User,
    @Response() res: any,
    @Body() editPasswordDto: EditPasswordDto
  ) {
    const isValidPass = await bcrypt.compare(
      editPasswordDto.oldPassword,
      user.password
    );

    if (!isValidPass) {
      return res
        .status(HttpStatus.INTERNAL_SERVER_ERROR)
        .json({ message: "L'ancien mot de passe est incorrect" });
    }

    this.usersService.editPassword(user, editPasswordDto).then(
      () => {
        return res.status(HttpStatus.OK).json({ message: "OK" });
      },
      (error) => {
        return res
          .status(HttpStatus.INTERNAL_SERVER_ERROR)
          .json({ message: "EDIT_PASSWORD", content: JSON.stringify(error) });
      }
    );
  }
}
