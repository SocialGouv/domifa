import { Inject, Injectable } from "@nestjs/common";
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
    createdStructure.id = this.lastId(await this.findLast());
    return createdStructure.save();
  }

  public async findById(structureId: number) {
    return this.structureModel
      .findOne({ id: structureId })
      .populate("users")
      .lean()
      .exec();
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

  private async findLast(): Promise<Structure> {
    return this.structureModel
      .findOne()
      .select("id")
      .sort({ id: -1 })
      .limit(1)
      .exec();
  }

  private lastId(structure: Structure): number {
    if (structure) {
      if (structure.id !== undefined) {
        return structure.id + 1;
      }
    }
    return 1;
  }
}
