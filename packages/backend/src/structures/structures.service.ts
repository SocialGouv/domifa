import { HttpException, HttpStatus, Inject, Injectable } from "@nestjs/common";
import * as crypto from "crypto";
import { Model } from "mongoose";
import { ConfigService } from "../config/config.service";
import { MailerService } from "../users/mailer.service";
import { User } from "../users/user.interface";
import { StructureDto } from "./structure-dto";
import { Structure } from "./structure-interface";

@Injectable()
export class StructuresService {
  public labels = {
    asso: "Organisme agrée",
    ccas: "CCAS / CIAS"
  };
  constructor(
    @Inject("STRUCTURE_MODEL")
    private readonly structureModel: Model<Structure>,
    private readonly configService: ConfigService
  ) {}

  public async create(structureDto: StructureDto): Promise<any> {
    const createdStructure = new this.structureModel(structureDto);
    createdStructure.id = await this.findLast();
    createdStructure.token = crypto.randomBytes(35).toString("hex");
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

  public async findById(structureId: number): Promise<any> {
    const structure = await this.structureModel
      .findOne({ id: structureId })
      .exec();
    if (!structure || structure === null) {
      throw new HttpException("NOT_EXIST", HttpStatus.BAD_REQUEST);
    }
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

  public async findAll() {
    return this.structureModel
      .find({ verified: true })
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
