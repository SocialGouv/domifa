import {
  Body,
  Controller,
  Delete,
  Get,
  HttpException,
  HttpStatus,
  Param,
  Post,
  Response,
  UseGuards,
  Patch
} from "@nestjs/common";
import { AuthGuard } from "@nestjs/passport";
import { CurrentUser } from "../auth/current-user.decorator";
import { RolesGuard } from "../auth/roles.guard";
import { InteractionsService } from "../interactions/interactions.service";
import { UsagersService } from "../usagers/services/usagers.service";
import { EmailDto } from "../users/dto/email.dto";
import { MailerService } from "../users/services/mailer.service";
import { UsersService } from "../users/services/users.service";
import { User } from "../users/user.interface";
import { StructureDto } from "./dto/structure.dto";
import { StructuresService } from "./structures.service";
import { StructureEditDto } from "./dto/structure-edit.dto";

@Controller("structures")
export class StructuresController {
  constructor(
    private readonly structureService: StructuresService,
    private readonly usersService: UsersService,
    private readonly usagersService: UsagersService,
    private readonly interactionsService: InteractionsService,
    private readonly mailerService: MailerService
  ) {}

  @Post()
  public async postStructure(@Body() structureDto: StructureDto) {
    return this.structureService.create(structureDto);
  }

  @UseGuards(AuthGuard("jwt"))
  @UseGuards(RolesGuard)
  @Patch()
  public async patchStructure(
    @Body() structureDto: StructureEditDto,
    @CurrentUser() user: User
  ) {
    return this.structureService.patch(structureDto, user);
  }

  @Get("code-postal/:codePostal")
  public async getByCity(@Param("codePostal") codePostal: string) {
    return this.structureService.findAll(codePostal);
  }

  @UseGuards(AuthGuard("jwt"))
  @Get("ma-structure")
  public async getMyStructure(@CurrentUser() user: User) {
    return user.structure;
  }

  @UseGuards(AuthGuard("jwt"))
  @UseGuards(RolesGuard)
  @Get()
  public async getAllStructures() {
    return this.structureService.findAll();
  }

  @Delete(":token")
  public async deleteOne(@Param("token") token: string) {
    return this.structureService.delete(token);
  }

  @Get("confirm/:token")
  public async confim(@Param("token") token: string): Promise<any> {
    if (token === "") {
      throw new HttpException("BAD_REQUEST", HttpStatus.BAD_REQUEST);
    }

    const structure = await this.structureService.checkToken(token);

    if (!structure || structure === null) {
      throw new HttpException("BAD_REQUEST", HttpStatus.BAD_REQUEST);
    } else {
      const admin = await this.usersService.findOne({
        role: "admin",
        structureId: structure.id
      });

      const updatedAdmin = await this.usersService.update(
        admin.id,
        structure.id,
        {
          verified: true
        }
      );

      this.mailerService.confirmationStructure(structure, updatedAdmin);
      return structure;
    }
  }

  @Post("validate-email")
  public async validateEmail(@Body() emailDto: EmailDto, @Response() res: any) {
    const existUser = await this.structureService.findOneBasic({
      email: emailDto.email
    });
    const emailExist = existUser !== null;
    return res.status(HttpStatus.OK).json(emailExist);
  }

  @UseGuards(AuthGuard("jwt"))
  @UseGuards(RolesGuard)
  @Get("hard-reset")
  public async hardReset(@Response() res: any, @CurrentUser() user: User) {
    const charset = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
    const expireAt = new Date();
    expireAt.setDate(expireAt.getDate() + 1);

    let token = "";
    for (let i = 0; i < 7; i++) {
      token += charset.charAt(Math.floor(Math.random() * charset.length));
    }
    const hardResetToken = { token, expireAt, userId: user._id };
    const structure = await this.structureService.hardReset(
      user.structureId,
      hardResetToken
    );
    if (structure) {
      await this.mailerService.hardReset(user, hardResetToken.token);
      return res.status(HttpStatus.OK).json({ message: expireAt });
    } else {
      throw new HttpException(
        "HARD_RESET_ERROR",
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  @UseGuards(AuthGuard("jwt"))
  @UseGuards(RolesGuard)
  @Get("hard-reset-confirm/:token")
  public async hardResetConfirm(
    @Response() res: any,
    @Param("token") token: string,
    @CurrentUser() user: User
  ) {
    const structure = await this.structureService.checkHardResetToken(
      user._id,
      token
    );

    if (!structure || structure === null) {
      throw new HttpException(
        "HARD_RESET_INCORRECT_TOKEN",
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }

    const today = new Date();
    if (structure.hardReset.expireAt < today) {
      throw new HttpException(
        "HARD_RESET_EXPIRED_TOKEN",
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }

    await this.usagersService.deleteAll(user.structureId);
    await this.interactionsService.deleteAll(user.structureId);
    await this.structureService.hardResetClean(structure._id);
    return res.status(HttpStatus.OK).json({ message: "success" });
  }

  @Get(":id")
  public async getStructure(@Param("id") id: number) {
    return this.structureService.findOneBasic({ id });
  }
}
