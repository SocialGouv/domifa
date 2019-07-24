import { HttpException, HttpStatus, Inject, Injectable } from "@nestjs/common";
import { Model } from "mongoose";
import { User } from "../users/user.interface";
import { StructureDto } from "./structure-dto";
import { Structure } from "./structure-interface";

@Injectable()
export class StructuresService {
  constructor(
    @Inject("STRUCTURE_MODEL") private readonly structureModel: Model<Structure>
  ) {}

  public async create(structureDto: StructureDto): Promise<Structure> {
    const createdStructure = new this.structureModel(structureDto);
    createdStructure.id = await this.findLast();
    return createdStructure.save();
  }

  public async findById(structureId: number) {
    const structure = await this.structureModel
      .findOne({ id: structureId })
      .lean()
      .exec();
    if (!structure || structure.length === 0) {
      throw new HttpException("NOT_FOUND", HttpStatus.NOT_FOUND);
    }
    return structure;
  }

  public async addUser(user: User, structureId: number) {
    const structure = await this.findById(structureId);

    structure.users.push(user);
    return this.structureModel
      .findOneAndUpdate(
        { id: structureId },
        {
          $set: structure
        },
        {
          new: true
        }
      )
      .exec();
  }

  public async findAll() {
    return this.structureModel
      .find()
      .limit(10)
      .lean()
      .exec();
  }

  public async deleteById(structureId: number): Promise<any> {
    return this.structureModel.deleteOne({
      id: structureId
    });
  }

  public async findLast(): Promise<number> {
    try {
      const lastStructure = await this.structureModel
        .findOne({}, { id: 1 })
        .sort({ id: -1 })
        .lean()
        .exec();
      return lastStructure.id === undefined ? 1 : lastStructure.id + 1;
    } catch (e) {
      return 1;
    }
  }
}
