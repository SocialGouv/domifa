import { HttpException, HttpStatus, Inject, Injectable } from "@nestjs/common";
import * as crypto from "crypto";
import { Model } from "mongoose";
import { User } from "../users/user.interface";

import { StructureDto } from "./structure-dto";
import { Structure } from "./structure-interface";

export interface StructureQuery {
  codePostal?: string;
  verified: boolean;
}

@Injectable()
export class StructuresService {
  public labels = {
    asso: "Organisme agrée",
    ccas: "CCAS / CIAS"
  };

  constructor(
    @Inject("STRUCTURE_MODEL")
    private structureModel: Model<Structure>,
    @Inject("USER_MODEL")
    private userModel: Model<User>
  ) {}

  public async create(structureDto: StructureDto): Promise<any> {
    const createdStructure = new this.structureModel(structureDto);
    createdStructure.id = await this.findLast();
    createdStructure.token = crypto.randomBytes(30).toString("hex");
    const structure = await createdStructure.save();
    return structure;
  }

  public async checkToken(token: string): Promise<any> {
    return this.structureModel
      .findOneAndUpdate(
        { token },
        {
          $set: {
            token: "",
            verified: true
          }
        },
        {
          new: true
        }
      )
      .exec();
  }

  public async findOne(structureId: number): Promise<Structure> {
    const structure = await this.structureModel
      .findOne({ id: structureId })
      .exec();
    if (!structure || structure === null) {
      throw new HttpException("NOT_EXIST", HttpStatus.BAD_REQUEST);
    }
    return structure;
  }

  public async findOneBasic(param: any): Promise<any> {
    const structure = await this.structureModel
      .findOne(param)
      .select("-users -token -email -phone -responsable")
      .exec();
    return structure;
  }

  public async addUser(user: User, structureId: number): Promise<any> {
    return this.structureModel
      .findOneAndUpdate(
        { id: structureId },
        {
          $push: { users: user }
        },
        {
          new: true
        }
      )
      .exec();
  }

  public async findAll(codePostal?: string) {
    const params: StructureQuery = {
      verified: true
    };

    if (codePostal) {
      params.codePostal = codePostal;
    }

    return this.structureModel
      .find(params)
      .limit(100)
      .lean()
      .select("-users -token -email -phone -responsable")
      .exec();
  }

  public async delete(token: string): Promise<any> {
    const structure = await this.structureModel
      .findOne({ token })
      .populate("users")
      .exec();
    if (!structure || structure === null) {
      throw new HttpException("NOT_EXIST", HttpStatus.BAD_REQUEST);
    }

    structure.users.forEach(user => {
      return this.userModel
        .deleteOne({
          id: user.id,
          structureId: user.structureId
        })
        .exec();
    });

    return this.structureModel.deleteOne({
      token
    });
  }

  public async importSuccess(id: number) {
    return this.structureModel
      .findOneAndUpdate(
        {
          id
        },
        {
          $set: {
            import: true
          }
        },
        {
          new: true
        }
      )
      .exec();
  }

  public async findLast(): Promise<number> {
    const lastStructure: any = await this.structureModel
      .findOne({}, { id: 1 })
      .sort({ id: -1 })
      .lean()
      .exec();

    return lastStructure === {} || lastStructure === null
      ? 1
      : lastStructure.id + 1;
  }
}
