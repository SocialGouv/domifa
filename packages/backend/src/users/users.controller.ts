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
    private readonly mailerService: MailerService
  ) {}

  @UseGuards(AuthGuard("jwt"))
  @Get()
  public findAll(@Req() request: Request): Promise<User[]> {
    return this.usersService.findAll();
  }

  @Get("structure/:id")
  public findByStructure(@Param("id") id: number) {
    return this.usersService.findByStructure(id);
  }

  @Delete(":id")
  public deleteOne(@Param("id") id: number) {
    return this.usersService.deleteById(id);
  }

  @Post()
  public async create(@Body() userDto: UserDto, @Response() res: any) {
    const user = await this.usersService.findByEmail(userDto.email);
    if (user) {
      return res
        .status(HttpStatus.BAD_REQUEST)
        .json({ message: "EMAIL_EXIST" });
    } else {
      const userSave = await this.usersService.create(userDto);
      if (userSave) {
        userSave.password = undefined;
      }
      return res.status(HttpStatus.OK).json(userSave);
    }
  }

  @Get("check-password-token/:token")
  public async checkPasswordToken(@Param("token") token: string) {
    const today = new Date();
    const existUser = await this.usersService.findOneBy({
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
    const existUser = await this.usersService.findOneBy({
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

    return this.usersService.updatePassword(resetPasswordDto);
  }

  @Post("get-password-token")
  public async generatePasswordToken(
    @Body() emailDto: EmailDto,
    @Response() res: any
  ) {
    const user = await this.usersService.findByEmail(emailDto.email);
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
