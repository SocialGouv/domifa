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
  UseGuards
} from "@nestjs/common";
import { AuthGuard } from "@nestjs/passport";
import { ApiBearerAuth, ApiTags } from "@nestjs/swagger";
import { AxiosError, AxiosResponse } from "axios";
import * as fs from "fs";
import * as rimraf from "rimraf";
import { CurrentUser } from "../auth/current-user.decorator";
import { AdminGuard } from "../auth/guards/admin.guard";
import { DomifaGuard } from "../auth/guards/domifa.guard";
import { configService } from "../config";
import { InteractionsService } from "../interactions/interactions.service";
import { DomifaMailsService } from "../mails/services/domifa-mails.service";
import { StructuresMailsService } from "../mails/services/structures-mails.service";
import { UsagersMailsService } from "../mails/services/usagers-mails.service";
import { UsagersService } from "../usagers/services/usagers.service";
import { EmailDto } from "../users/dto/email.dto";
import { usersRepository } from "../users/pg/users-repository.service";
import { UsersService } from "../users/services/users.service";
import { appLogger } from "../util";
import { AppAuthUser } from "../_common/model";
import { StructureEditDto } from "./dto/structure-edit.dto";
import { StructureDto } from "./dto/structure.dto";
import { StructuresService } from "./services/structures.service";

@Controller("structures")
@ApiTags("structures")
export class StructuresController {
  constructor(
    private structureService: StructuresService,
    private usersService: UsersService,
    private usagersService: UsagersService,
    private interactionsService: InteractionsService,
    private domifaMailsService: DomifaMailsService,
    private usagersMailsService: UsagersMailsService,
    private structuresMailsService: StructuresMailsService
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

  @Get("code-postal/:codePostal")
  public async getByCity(@Param("codePostal") codePostal: string) {
    return this.structureService.findAllPublic(codePostal);
  }

  @Get("confirm/:id/:token")
  public async confim(
    @Param("token") token: string,
    @Param("id") id: string,
    @Response() res: any
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
      const admin = await usersRepository.findOne({
        role: "admin",
        structureId: structure.id,
      });

      const updatedAdmin = await usersRepository.updateOne(
        {
          id: admin.id,
          structureId: structure.id,
        },
        { verified: true }
      );

      if (configService.get("DOMIFA_EMAILS_ENABLE") !== "true") {
        return res.status(HttpStatus.OK).json({ message: "OK" });
      }

      this.structuresMailsService
        .confirmationStructure(structure, updatedAdmin)
        .then(
          (result: AxiosResponse) => {
            if (result.status !== 200) {
              appLogger.warn(
                `[StructuresMail] mail confirm structure activation failed`
              );
              appLogger.error(JSON.stringify(result.data));
              throw new HttpException(
                "TIPIMAIL_CONFIRM_STRUCTURE_ERROR",
                HttpStatus.INTERNAL_SERVER_ERROR
              );
            } else {
              return res.status(HttpStatus.OK).json("OK");
            }
          },
          (error: AxiosError) => {
            appLogger.warn(
              `[StructuresMail] mail confirm structure activation failed`
            );
            appLogger.error(JSON.stringify(error.message));
            throw new HttpException(
              "TIPIMAIL_CONFIRM_STRUCTURE_ERROR",
              HttpStatus.INTERNAL_SERVER_ERROR
            );
          }
        );
    }
  }

  @ApiBearerAuth()
  @UseGuards(AuthGuard("jwt"), AdminGuard)
  @Patch()
  public async patchStructure(
    @Body() structureDto: StructureEditDto,
    @CurrentUser() user: AppAuthUser
  ) {
    return this.structureService.patch(structureDto, user);
  }
  @UseGuards(AuthGuard("jwt"))
  @ApiBearerAuth()
  @Get("ma-structure")
  public async getMyStructure(@CurrentUser() user: AppAuthUser) {
    return user.structure;
  }

  @UseGuards(AuthGuard("jwt"), AdminGuard)
  @ApiBearerAuth()
  @Get("hard-reset")
  public async hardReset(@Response() res: any, @CurrentUser() user: AppAuthUser) {
    const charset = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
    const expireAt = new Date();
    expireAt.setDate(expireAt.getDate() + 1);

    let token = "";
    for (let i = 0; i < 7; i++) {
      token += charset.charAt(Math.floor(Math.random() * charset.length));
    }
    const hardResetToken = { token, expireAt, userId: user.id };
    const structure = await this.structureService.hardReset(
      user.structureId,
      hardResetToken
    );
    if (structure) {
      if (configService.get("DOMIFA_EMAILS_ENABLE") !== "true") {
        return res.status(HttpStatus.OK).json({ message: "OK" });
      }

      await this.usagersMailsService.hardReset(user, hardResetToken.token);
      return res.status(HttpStatus.OK).json({ message: expireAt });
    } else {
      throw new HttpException(
        "HARD_RESET_ERROR",
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  @UseGuards(AuthGuard("jwt"), AdminGuard)
  @ApiBearerAuth()
  @Get("hard-reset-confirm/:token")
  public async hardResetConfirm(
    @Response() res: any,
    @Param("token") token: string,
    @CurrentUser() user: AppAuthUser
  ) {
    const structure = await this.structureService.checkHardResetToken(
      user.id,
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

  @UseGuards(AuthGuard("jwt"), DomifaGuard)
  @ApiBearerAuth()
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
      await usersRepository.deleteByCriteria({
        structureId: structure.id,
      });
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

  @UseGuards(AuthGuard("jwt"), DomifaGuard)
  @ApiBearerAuth()
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

  @UseGuards(AuthGuard("jwt"), DomifaGuard)
  @ApiBearerAuth()
  @Delete(":id")
  public async deleteStructure(@Response() res: any, @Param("id") id: string) {
    const structure = await this.structureService.generateDeleteToken(id);

    if (structure && structure !== null) {
      if (configService.get("DOMIFA_EMAILS_ENABLE") !== "true") {
        return res.status(HttpStatus.OK).json({ message: "OK" });
      }

      this.domifaMailsService.deleteStructure(structure).then(
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
