import { Body, Controller, HttpStatus, Post, Res } from "@nestjs/common";
import { ApiTags } from "@nestjs/swagger";
import { EmailDto } from "../../users/dto/email.dto";
import { ExpressResponse } from "../../../util/express";
import { StructureWithUserDto } from "../dto/structure-with-user.dto";
import { StructureDto } from "../dto/structure.dto";
import { structureCreatorService } from "../services/structureCreator.service";
import { StructuresService } from "../services/structures.service";
import { structureRepository } from "../../../database";
import { CodePostalDto } from "../dto";

@Controller("structures")
@ApiTags("structures")
export class StructuresPublicController {
  constructor(private readonly structureService: StructuresService) {}

  @Post()
  public async postStructure(
    @Body() structureWithUserDto: StructureWithUserDto,
    @Res() res: ExpressResponse
  ) {
    try {
      await structureCreatorService.createStructureWithAdminUser(
        structureWithUserDto.structure,
        structureWithUserDto.user
      );
      return res.status(HttpStatus.OK).json("OK");
    } catch (e) {
      console.log(e);
      return res.status(HttpStatus.BAD_REQUEST).json("CREATE_STRUCTURE_FAIL");
    }
  }

  @Post("pre-post")
  public prePostStructure(@Body() structureDto: StructureDto) {
    return structureCreatorService.checkStructureCreateArgs(structureDto);
  }

  @Post("validate-email")
  public async validateEmail(
    @Body() emailDto: EmailDto,
    @Res() res: ExpressResponse
  ) {
    const exist = await structureRepository.findOneBy({
      email: emailDto.email.toLowerCase(),
    });

    return res.status(HttpStatus.OK).json(!!exist);
  }

  @Post("code-postal")
  public async getByCity(@Body() codePostalDto: CodePostalDto) {
    return await this.structureService.findAllLight(codePostalDto);
  }
}
