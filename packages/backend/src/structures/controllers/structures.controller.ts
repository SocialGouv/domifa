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
import { ApiBearerAuth, ApiTags } from "@nestjs/swagger";
import { CurrentUser } from "../../auth/current-user.decorator";
import { AdminGuard } from "../../auth/guards/admin.guard";
import { DomifaGuard } from "../../auth/guards/domifa.guard";
import { usagerRepository, usersRepository } from "../../database";
import { structureLightRepository } from "../../database/services/structure/structureLightRepository.service";
import { InteractionsService } from "../../interactions/interactions.service";
import {
  DomifaMailsService,
  StructuresMailsService,
  UsagersMailsService,
} from "../../mails/services";
import { StatsService } from "../../stats/services/stats.service";
import { UsagersService } from "../../usagers/services/usagers.service";
import { EmailDto } from "../../users/dto/email.dto";
import { AppAuthUser } from "../../_common/model";
import { StructureEditDto } from "../dto/structure-edit.dto";
import { StructureWithUserDto } from "../dto/structure-with-user.dto";
import { StructureDto } from "../dto/structure.dto";
import { StructureCreatorService } from "../services/structureCreator.service";
import { StructureDeletorService } from "../services/structureDeletor.service";
import { StructureHardResetService } from "../services/structureHardReset.service";
import { StructuresService } from "../services/structures.service";

import moment = require("moment");

@Controller("structures")
@ApiTags("structures")
export class StructuresController {
  constructor(
    private structureCreatorService: StructureCreatorService,
    private structureDeletorService: StructureDeletorService,
    private structureHardResetService: StructureHardResetService,
    private structureService: StructuresService,
    private statsService: StatsService,
    private usagersService: UsagersService,
    private interactionsService: InteractionsService,
    private domifaMailsService: DomifaMailsService,
    private usagersMailsService: UsagersMailsService,
    private structuresMailsService: StructuresMailsService
  ) {}

  @Post()
  public async postStructure(
    @Body() structureWithUserDto: StructureWithUserDto
  ) {
    const structure = await this.structureCreatorService.createStructureWithAdminUser(
      structureWithUserDto.structure,
      structureWithUserDto.user
    );
    return structure;
  }

  @Post("pre-post")
  public async prePostStructure(@Body() structureDto: StructureDto) {
    return this.structureCreatorService.checkStructureCreateArgs(structureDto);
  }

  @Post("validate-email")
  public async validateEmail(@Body() emailDto: EmailDto, @Response() res: any) {
    const exist = await structureLightRepository.findOne({
      email: emailDto.email.toLowerCase(),
    });
    return res.status(HttpStatus.OK).json(!!exist);
  }

  @Get("code-postal/:codePostal")
  public async getByCity(@Param("codePostal") codePostal: string) {
    return this.structureService.findAllLight(codePostal);
  }

  @Get("confirm/:id/:token")
  public async confirmStructureCreation(
    @Param("token") token: string,
    @Param("id") id: string,
    @Response() res: any
  ): Promise<any> {
    if (token === "") {
      throw new HttpException("STRUCTURE_TOKEN_EMPTY", HttpStatus.BAD_REQUEST);
    }

    const structure = await this.structureCreatorService.checkCreationToken({
      token,
      structureId: parseInt(id, 10),
    });

    if (!structure) {
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

      await this.structuresMailsService.confirmationStructure(
        structure,
        updatedAdmin
      );
      return res.status(HttpStatus.OK).json({ message: "OK" });
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
  public async hardReset(
    @Response() res: any,
    @CurrentUser() user: AppAuthUser
  ) {
    const charset = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
    const expireAt = new Date();
    expireAt.setDate(expireAt.getDate() + 1);

    let token = "";
    for (let i = 0; i < 7; i++) {
      token += charset.charAt(Math.floor(Math.random() * charset.length));
    }
    const hardResetToken = { token, expireAt, userId: user.id };
    const structure = await this.structureHardResetService.hardReset(
      user.structureId,
      hardResetToken
    );

    if (structure) {
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
    const structure = await this.structureHardResetService.checkHardResetToken(
      user.id,
      token
    );

    if (!structure) {
      throw new HttpException(
        "HARD_RESET_INCORRECT_TOKEN",
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }

    const now = new Date();
    if (structure.hardReset.expireAt && structure.hardReset.expireAt < now) {
      throw new HttpException(
        "HARD_RESET_EXPIRED_TOKEN",
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }

    await this.statsService.deleteAll(structure.id);
    await usagerRepository.deleteByCriteria({
      structureId: user.structureId,
    });
    await this.interactionsService.deleteAll(user.structureId);
    await this.structureHardResetService.hardResetClean(structure.id);

    /*
    const today = moment().utc().startOf("day").toDate();
    await this.statsGeneratorService.generateStructureStats(
      today,
      structure,
      true
    );
    */

    return res.status(HttpStatus.OK).json({ message: "success" });
  }

  @Get(":id")
  public async getStructure(@Param("id") id: number) {
    return structureLightRepository.findOne({ id });
  }

  @UseGuards(AuthGuard("jwt"), DomifaGuard)
  @ApiBearerAuth()
  @Delete("confirm/:id/:token/:nom")
  public async deleteOne(
    @Param("id") id: string,
    @Param("token") token: string,
    @Param("nom") nom: string
  ) {
    return this.structureDeletorService.deleteOne({
      structureId: parseInt(id),
      token,
      structureNom: nom,
    });
  }

  @UseGuards(AuthGuard("jwt"), DomifaGuard)
  @ApiBearerAuth()
  @Delete("check/:id/:token")
  public async checkDelete(
    @Param("id") id: string,
    @Param("token") token: string
  ) {
    const structure = await structureLightRepository.findOne({
      token,
      id: id,
    });
    if (!structure) {
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
  public async sendMailConfirmDeleteStructure(
    @Response() res: any,
    @Param("id") id: string
  ) {
    const structure = await this.structureDeletorService.generateDeleteToken(
      parseInt(id, 10)
    );

    if (!!structure) {
      this.domifaMailsService.sendMailConfirmDeleteStructure(structure).then(
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
