import { StructuresService } from './structures.service';
import { StructureDto } from './structure-dto';
import { Structure } from './structure-interface';
export declare class StructuresController {
    private readonly structuresService;
    constructor(structuresService: StructuresService);
    postStructure(structureDto: StructureDto): Promise<Structure>;
    getStructure(id: number): Promise<Structure>;
}
