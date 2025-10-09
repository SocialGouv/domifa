import { Body, Controller, HttpStatus, Post, Res } from "@nestjs/common";
import { ApiTags } from "@nestjs/swagger";
import { ExpressResponse } from "../../../util/express";
import { StructureWithUserDto } from "../dto/structure-with-user.dto";
import { StructureDto } from "../dto/structure.dto";
import { structureCreatorService } from "../services/structureCreator.service";
import { StructuresService } from "../services/structures.service";
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
      return res.status(HttpStatus.BAD_REQUEST).json("CREATE_STRUCTURE_FAIL");
    }
  }

  @Post("pre-post")
  public prePostStructure(@Body() structureDto: StructureDto) {
    return structureCreatorService.checkStructureCreateArgs(structureDto);
  }

  @Post("code-postal")
  public async getByCity(@Body() codePostalDto: CodePostalDto) {
    return await this.structureService.findAllLight(codePostalDto);
  }
}
