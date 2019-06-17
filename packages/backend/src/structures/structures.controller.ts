import { Body, Controller, Delete, Get, Param, Post } from "@nestjs/common";
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

  @Get()
  public getAllStructures(): Promise<Structure> {
    return this.structuresService.findAll();
  }

  @Delete(":id")
  public deleteOne(@Param("id") id: number) {
    return this.structuresService.deleteById(id);
  }
}
