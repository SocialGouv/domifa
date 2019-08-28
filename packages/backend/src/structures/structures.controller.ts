import {
  Body,
  Controller,
  Delete,
  Get,
  HttpException,
  HttpStatus,
  Param,
  Post
} from "@nestjs/common";
import { StructureDto } from "./structure-dto";
import { Structure } from "./structure-interface";
import { StructuresService } from "./structures.service";

@Controller("structures")
export class StructuresController {
  constructor(private readonly structuresService: StructuresService) {}

  /* FORMULAIRE INFOS */
  @Post()
  public postStructure(@Body() structureDto: StructureDto) {
    return this.structuresService.create(structureDto);
  }

  @Get(":id")
  public getStructure(@Param("id") id: number): Promise<Structure> {
    return this.structuresService.findById(id);
  }

  @Get("confirm/:token")
  public confim(@Param("token") token: string): Promise<Structure> {
    if (token === "") {
      throw new HttpException("BAD_REQUEST", HttpStatus.BAD_REQUEST);
    }
    return this.structuresService.checkToken(token);
  }

  @Get()
  public getAllStructures(): Promise<Structure> {
    return this.structuresService.findAll();
  }

  @Delete(":id")
  public deleteOne(@Param("id") id: number) {
    return this.structuresService.deleteById(id);
  }
}
