import { Inject, Injectable } from '@nestjs/common';
import { Model } from 'mongoose';
import { StructureDto } from './structure-dto';
import { Structure } from './structure-interface';

@Injectable()
export class StructuresService {

  constructor(@Inject('STRUCTURE_MODEL') private readonly structureModel: Model<Structure>) {

  }

  public async create(structureDto: StructureDto): Promise<Structure> {
    const createdStructure = new this.structureModel(structureDto);
    createdStructure.id = this.lastId(await this.findLast());
    return createdStructure.save();
  }

  public async findById(id: number) {
    return this.structureModel.findOne({ 'id': id }).populate('users').lean().exec();
  }

  private async findLast(): Promise<Structure> {
    return this.structureModel.findOne().select('id').sort({ id: -1 }).limit(1).exec();
  }

  private lastId(structure): number{
    if (structure) {
      if (structure.id !== undefined) {
        return structure.id + 1;
      }
    }
    return 1;
  }

}
