import { CodePostalDto } from "./../dto/code-postal.dto";
import { Body, Controller, HttpStatus, Post, Res } from "@nestjs/common";
import { ApiTags } from "@nestjs/swagger";
import { structureLightRepository } from "../../database/services/structure/structureLightRepository.service";
import { EmailDto } from "../../users/dto/email.dto";
import { ExpressResponse } from "../../util/express";
import { StructureWithUserDto } from "../dto/structure-with-user.dto";
import { StructureDto } from "../dto/structure.dto";
import { structureCreatorService } from "../services/structureCreator.service";
import { StructuresService } from "../services/structures.service";

@Controller("structures")
@ApiTags("structures")
export class StructuresPublicController {
  constructor(private structureService: StructuresService) {}

  @Post()
  public async postStructure(
    @Body() structureWithUserDto: StructureWithUserDto
  ) {
    const structure =
      await structureCreatorService.createStructureWithAdminUser(
        structureWithUserDto.structure,
        structureWithUserDto.user
      );
    return structure;
  }

  @Post("pre-post")
  public async prePostStructure(@Body() structureDto: StructureDto) {
    return structureCreatorService.checkStructureCreateArgs(structureDto);
  }

  @Post("validate-email")
  public async validateEmail(
    @Body() emailDto: EmailDto,
    @Res() res: ExpressResponse
  ) {
    const exist = await structureLightRepository.findOneBy({
      email: emailDto.email.toLowerCase(),
    });

    return res.status(HttpStatus.OK).json(!!exist);
  }

  @Post("code-postal")
  public async getByCity(@Body() codePostalDto: CodePostalDto) {
    return this.structureService.findAllLight(codePostalDto);
  }
}
