import {
  Body,
  Controller,
  Get,
  HttpException,
  HttpStatus,
  Param,
  Post,
  Response,
} from "@nestjs/common";
import { ApiTags } from "@nestjs/swagger";
import { userStructureRepository } from "../../database";
import { structureLightRepository } from "../../database/services/structure/structureLightRepository.service";
import { userAccountActivatedEmailSender } from "../../mails/services/templates-renderers";
import { EmailDto } from "../../users/dto/email.dto";
import { StructureWithUserDto } from "../dto/structure-with-user.dto";
import { StructureDto } from "../dto/structure.dto";
import { StructureCreatorService } from "../services/structureCreator.service";
import { StructuresService } from "../services/structures.service";

@Controller("structures")
@ApiTags("structures")
export class StructuresPublicController {
  constructor(
    private structureCreatorService: StructureCreatorService,
    private structureService: StructuresService
  ) {}

  @Post()
  public async postStructure(
    @Body() structureWithUserDto: StructureWithUserDto
  ) {
    const structure =
      await this.structureCreatorService.createStructureWithAdminUser(
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
      const admin = await userStructureRepository.findOne({
        role: "admin",
        structureId: structure.id,
      });

      const updatedAdmin = await userStructureRepository.updateOne(
        {
          id: admin.id,
          structureId: structure.id,
        },
        { verified: true }
      );

      await userAccountActivatedEmailSender.sendMail({ user: updatedAdmin });
      return res.status(HttpStatus.OK).json({ message: "OK" });
    }
  }
}
