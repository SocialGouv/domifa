import {
  Body,
  Controller,
  Delete,
  Get,
  HttpException,
  HttpStatus,
  Logger,
  Param,
  Patch,
  Post,
  Response,
  UseGuards,
} from "@nestjs/common";
import { AuthGuard } from "@nestjs/passport";
import { CurrentUser } from "../auth/current-user.decorator";
import { AdminGuard } from "../auth/guards/admin.guard";
import { InteractionsService } from "../interactions/interactions.service";
import { UsagersService } from "../usagers/services/usagers.service";
import { EmailDto } from "../users/dto/email.dto";
import { MailJetService } from "../users/services/mailjet.service";
import { UsersService } from "../users/services/users.service";
import { User } from "../users/user.interface";
import { StructureEditDto } from "./dto/structure-edit.dto";
import { StructureDto } from "./dto/structure.dto";
import { StructuresService } from "./structures.service";
import { DomifaGuard } from "../auth/guards/domifa.guard";
import { TipimailService } from "../users/services/tipimail.service";

import * as rimraf from "rimraf";
import * as fs from "fs";

@Controller("structures")
export class StructuresController {
  constructor(
    private readonly structureService: StructuresService,
    private readonly usersService: UsersService,
    private readonly usagersService: UsagersService,
    private readonly interactionsService: InteractionsService,
    private readonly mailjetService: MailJetService,
    private readonly tipimailService: TipimailService
  ) {}

  @Post()
  public async postStructure(@Body() structureDto: StructureDto) {
    return this.structureService.create(structureDto);
  }

  @Post("pre-post")
  public async prePostStructure(@Body() structureDto: StructureDto) {
    return this.structureService.prePost(structureDto);
  }

  @Post("validate-email")
  public async validateEmail(@Body() emailDto: EmailDto, @Response() res: any) {
    const exist = await this.structureService.findOneBasic({
      email: emailDto.email,
    });
    return res.status(HttpStatus.OK).json(exist !== null);
  }

  @UseGuards(AuthGuard("jwt"))
  @UseGuards(AdminGuard)
  @Patch()
  public async patchStructure(
    @Body() structureDto: StructureEditDto,
    @CurrentUser() user: User
  ) {
    return this.structureService.patch(structureDto, user);
  }

  @Get("code-postal/:codePostal")
  public async getByCity(@Param("codePostal") codePostal: string) {
    return this.structureService.findAllPublic(codePostal);
  }

  @UseGuards(AuthGuard("jwt"))
  @Get("ma-structure")
  public async getMyStructure(@CurrentUser() user: User) {
    return user.structure;
  }

  @Get("confirm/:id/:token")
  public async confim(
    @Param("token") token: string,
    @Param("id") id: string
  ): Promise<any> {
    if (token === "") {
      throw new HttpException("STRUCTURE_TOKEN_EMPTY", HttpStatus.BAD_REQUEST);
    }

    const structure = await this.structureService.checkToken(token, id);

    if (!structure || structure === null) {
      throw new HttpException(
        "STRUCTURE_TOKEN_INVALID",
        HttpStatus.BAD_REQUEST
      );
    } else {
      const admin = await this.usersService.findOne({
        role: "admin",
        structureId: structure.id,
      });

      const updatedAdmin = await this.usersService.update(
        admin.id,
        structure.id,
        {
          verified: true,
        }
      );

      this.mailjetService.confirmationStructure(structure, updatedAdmin);
      return structure;
    }
  }

  @UseGuards(AuthGuard("jwt"))
  @UseGuards(AdminGuard)
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
      await this.mailjetService.hardReset(user, hardResetToken.token);
      return res.status(HttpStatus.OK).json({ message: expireAt });
    } else {
      throw new HttpException(
        "HARD_RESET_ERROR",
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  @UseGuards(AuthGuard("jwt"))
  @UseGuards(AdminGuard)
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
    if (structure.hardReset.expireAt && structure.hardReset.expireAt < today) {
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

  @UseGuards(AuthGuard("jwt"))
  @UseGuards(DomifaGuard)
  @Delete("confirm/:id/:token/:nom")
  public async deleteOne(
    @Param("id") id: string,
    @Param("token") token: string,
    @Param("nom") nom: string,
    @Response() res: any
  ) {
    const structure = await this.structureService.findOneBasic({
      token,
      nom,
      _id: id,
    });

    if (structure && structure !== null) {
      await this.usersService.deleteAll(structure.id);
      await this.usagersService.deleteAll(structure.id);
      await this.interactionsService.deleteAll(structure.id);
      await this.structureService.delete(structure._id);

      const pathFile = process.env.UPLOADS_FOLDER + structure.id;
      if (fs.existsSync(pathFile)) {
        rimraf(pathFile, () => {
          return res
            .status(HttpStatus.OK)
            .json({ message: "ALL_DATA_DELETED" });
        });
      } else {
        return res.status(HttpStatus.OK).json({ message: "ACCOUNT_DELETED" });
      }
    } else {
      return res
        .status(HttpStatus.BAD_REQUEST)
        .json({ message: "DELETED_STRUCTURE_CONFIRM_IMPOSSIBLE" });
    }
  }

  @UseGuards(AuthGuard("jwt"))
  @UseGuards(DomifaGuard)
  @Delete("check/:id/:token")
  public async checkDelete(
    @Param("id") id: string,
    @Param("token") token: string
  ) {
    const structure = await this.structureService.findOneBasic({
      token,
      _id: id,
    });
    if (!structure || structure === null) {
      throw new HttpException(
        "HARD_RESET_INCORRECT_TOKEN",
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
    return structure;
  }

  @UseGuards(AuthGuard("jwt"))
  @UseGuards(DomifaGuard)
  @Delete(":id")
  public async deleteStructure(@Response() res: any, @Param("id") id: string) {
    const structure = await this.structureService.generateDeleteToken(id);

    if (structure && structure !== null) {
      this.tipimailService.deleteStructure(structure).then(
        (result) => {
          return res.status(HttpStatus.OK).json({ message: "OK" });
        },
        (error) => {
          return res
            .status(HttpStatus.INTERNAL_SERVER_ERROR)
            .json({ message: "MAIL_DELETE_STRUCTURE_ERROR" });
        }
      );
    } else {
      return res
        .status(HttpStatus.INTERNAL_SERVER_ERROR)
        .json({ message: "DELETED_STRUCTURE_NOT_FOUND" });
    }
    return true;
  }
}
