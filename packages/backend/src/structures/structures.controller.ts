import { Controller, Body, Post, Get, Param } from '@nestjs/common';
import { StructuresService } from './structures.service';
import { StructureDto } from './structure-dto';
import { Structure } from './structure-interface';

@Controller('structures')
export class StructuresController {

  constructor(private readonly structuresService: StructuresService){

  }

  /* FORMULAIRE INFOS */
  @Post()
  public postStructure(@Body() structureDto: StructureDto) {
    return this.structuresService.create(structureDto);
  }

  @Get(':id')
  public getStructure(@Param('id') id: number): Promise<Structure>{
    return this.structuresService.findById(id);
  }
}

