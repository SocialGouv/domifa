import { Model } from 'mongoose';
import { StructureDto } from './structure-dto';
import { Structure } from './structure-interface';
export declare class StructuresService {
    private readonly structureModel;
    constructor(structureModel: Model<Structure>);
    create(structureDto: StructureDto): Promise<Structure>;
    findById(id: number): Promise<any>;
    private findLast;
    private lastId;
}
