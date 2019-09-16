import {
  Body,
  Controller,
  Delete,
  Get,
  HttpException,
  HttpStatus,
  Param,
  Post,
  Req,
  Response,
  UseGuards
} from "@nestjs/common";
import { AuthGuard } from "@nestjs/passport";
import { Request } from "express";
import { RolesGuard } from "../auth/roles.guard";
import { StructuresService } from "../structures/structures.service";
import { CurrentUser } from "./current-user.decorator";
import { EmailDto } from "./dto/email.dto";
import { ResetPasswordDto } from "./dto/reset-password.dto";
import { UserDto } from "./dto/user.dto";
import { MailerService } from "./mailer.service";
import { User } from "./user.interface";
import { UsersService } from "./users.service";

@Controller("users")
export class UsersController {
  constructor(
    private readonly usersService: UsersService,
    private readonly structureService: StructuresService,
    private readonly mailerService: MailerService
  ) {}

  @UseGuards(AuthGuard("jwt"))
  @Get("structure/:id")
  public findByStructure(@Param("id") structureId: number) {
    return this.usersService.findOne({ structureId });
  }

  @UseGuards(AuthGuard("jwt"))
  @UseGuards(RolesGuard)
  @Get()
  public findAll(
    @Req() request: Request,
    @CurrentUser() user: User
  ): Promise<User[]> {
    return this.usersService.findAll(user);
  }

  @UseGuards(AuthGuard("jwt"))
  @UseGuards(RolesGuard)
  @Get("confirm/:id")
  public async confirmUser(@Param("id") id: number, @CurrentUser() user: User) {
    const confirmerUser = await this.usersService.update(id, user.structureId, {
      verified: true
    });

    if (confirmerUser) {
      this.mailerService.confirmUser(confirmerUser);
    }
    return confirmerUser;
  }

  @UseGuards(AuthGuard("jwt"))
  @UseGuards(RolesGuard)
  @Delete(":id")
  public deleteOne(@Param("id") id: number, @CurrentUser() user: User) {
    return this.usersService.delete(id, user.structureId);
  }

  @Post()
  public async create(@Body() userDto: UserDto, @Response() res: any) {
    const user = await this.usersService.findOne({ email: userDto.email });
    if (user) {
      return res
        .status(HttpStatus.BAD_REQUEST)
        .json({ message: "EMAIL_EXIST" });
    }

    const structure = await this.structureService.findById(userDto.structureId);

    if (!structure || structure === null) {
      return res
        .status(HttpStatus.BAD_REQUEST)
        .json({ message: "STRUCTURE_NOT_EXIST" });
    }

    const newUser = await this.usersService.create(userDto, structure);
    if (newUser) {
      if (newUser.role === "admin") {
        this.mailerService.newStructure(structure, newUser);
      } else {
        const admin = await this.usersService.findOne({ role: "admin" });
        this.mailerService.newUser(admin, newUser);
      }
      this.structureService.addUser(newUser, userDto.structureId);
      newUser.password = undefined;
      return res.status(HttpStatus.OK).json(newUser);
    }
    throw new HttpException("INTERNAL_ERROR", HttpStatus.INTERNAL_SERVER_ERROR);
  }

  @Get("check-password-token/:token")
  public async checkPasswordToken(@Param("token") token: string) {
    const today = new Date();
    const existUser = await this.usersService.findOne({
      "tokens.password": token
    });

    if (!existUser || existUser === null) {
      throw new HttpException("USER_NOT_EXIST", HttpStatus.BAD_REQUEST);
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
      "tokens.password": resetPasswordDto.token
    });

    if (!existUser || existUser === null) {
      return res
        .status(HttpStatus.BAD_REQUEST)
        .json({ message: "USER_NOT_EXIST" });
    }
    if (existUser.tokens.passwordValidity < today) {
      return res
        .status(HttpStatus.BAD_REQUEST)
        .json({ message: "TOKEN_EXPIRED" });
    }

    this.usersService.updatePassword(resetPasswordDto).then(
      user => {
        return res.status(HttpStatus.OK).json({ message: "OK" });
      },
      error => {
        return res
          .status(HttpStatus.INTERNAL_SERVER_ERROR)
          .json({ message: "MAIL_ERROR" });
      }
    );
  }

  @Post("get-password-token")
  public async generatePasswordToken(
    @Body() emailDto: EmailDto,
    @Response() res: any
  ) {
    const user = await this.usersService.findOne({ email: emailDto.email });
    if (!user) {
      return res
        .status(HttpStatus.BAD_REQUEST)
        .json({ message: "EMAIL_NOT_EXIST" });
    } else {
      const updatedUser = await this.usersService.generateTokenPassword(
        emailDto.email
      );

      if (updatedUser) {
        this.mailerService.newPassword(updatedUser).then(
          result => {
            return res.status(HttpStatus.OK).json({ message: "OK" });
          },
          error => {
            return res
              .status(HttpStatus.INTERNAL_SERVER_ERROR)
              .json({ message: "MAIL_ERROR" });
          }
        );
      } else {
        return res
          .status(HttpStatus.INTERNAL_SERVER_ERROR)
          .json({ message: "ERROR" });
      }
    }
  }
}
