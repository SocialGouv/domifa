import { HttpException, HttpStatus, Inject, Injectable } from "@nestjs/common";
import * as crypto from "crypto";
import { Model } from "mongoose";
import { User } from "../users/user.interface";

import { StructureEditDto } from "./dto/structure-edit.dto";
import { StructureDto } from "./dto/structure.dto";
import { Structure } from "./structure-interface";
import { regions } from "./regions.labels";

export interface StructureQuery {
  codePostal?: string;
  verified: boolean;
}

@Injectable()
export class StructuresService {
  public labels = {
    asso: "Organisme agrée",
    ccas: "CCAS",
    cias: "CIAS ou commune",
  };

  constructor(
    @Inject("STRUCTURE_MODEL")
    private structureModel: Model<Structure>,
    @Inject("USER_MODEL")
    private userModel: Model<User>
  ) {}

  public async prePost(structureDto: StructureDto): Promise<any> {
    return new this.structureModel(structureDto);
  }

  public async create(structureDto: StructureDto): Promise<any> {
    const createdStructure = new this.structureModel(structureDto);
    createdStructure.id = await this.findLast();
    createdStructure.token = crypto.randomBytes(30).toString("hex");

    const cp: string = createdStructure.codePostal.substring(0, 2);

    createdStructure.region =
      cp === "97" || cp === "98"
        ? regions[structureDto.codePostal.substring(0, 3)].regionCode
        : regions[cp].regionCode;

    const structure = await createdStructure.save();
    return structure;
  }

  public async patch(structureDto: StructureEditDto, user: User): Promise<any> {
    const cp: string = structureDto.codePostal.substring(0, 2);

    structureDto.region =
      cp === "97" || cp === "98"
        ? regions[structureDto.codePostal.substring(0, 3)].regionCode
        : regions[cp].regionCode;

    return this.structureModel
      .findOneAndUpdate(
        { _id: user.structure._id },
        { $set: structureDto },
        { new: true }
      )
      .exec();
  }

  public async updateLastExport(
    structureId: string,
    dateExport: Date
  ): Promise<any> {
    return this.structureModel
      .findOneAndUpdate(
        { _id: structureId },
        { $set: { lastExport: dateExport } }
      )
      .exec();
  }

  public async updateStructureStats(
    structureId: string,
    valide: number,
    refus: number,
    radie: number
  ): Promise<any> {
    const total = valide + refus + radie;
    return this.structureModel
      .findOneAndUpdate(
        { _id: structureId },
        {
          $set: {
            stats: { TOTAL: total, VALIDE: valide, REFUS: refus, RADIE: radie },
          },
        }
      )
      .exec();
  }

  public async updateRegions(): Promise<any> {
    this.structureModel
      .findOne({ region: { $exists: false } })
      .exec((erreur: any, structure: Structure) => {
        if (erreur || structure === null) {
          return "RIEN A UPDATE";
        }

        const dep: string = structure.codePostal.substring(0, 2);
        const region =
          typeof regions[dep] === "undefined"
            ? "ERREUR_REGION"
            : regions[dep].regionCode;

        this.structureModel
          .findOneAndUpdate(
            { _id: structure._id },
            { $set: { region, departement: dep } }
          )
          .exec((err: any, ret: any) => {
            if (err === null) {
              this.updateRegions();
              return "UPDATE 1 ";
            }
            return "FIN DES UPDATES";
          });
      });
  }

  public async updateLastLogin(structureId: number): Promise<any> {
    return this.structureModel
      .findOneAndUpdate(
        { id: structureId },
        { $set: { lastLogin: new Date() } }
      )
      .exec();
  }

  public async checkToken(token: string): Promise<any> {
    return this.structureModel
      .findOneAndUpdate(
        { token },
        { $set: { token: "", verified: true } },
        { new: true }
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

  public async checkHardResetToken(
    userId: string,
    token: string
  ): Promise<Structure | null> {
    return this.structureModel
      .findOne({ "hardReset.token": token, "hardReset.userId": userId })
      .select("+hardReset")
      .exec();
  }

  public async addUser(user: User, structureId: number): Promise<any> {
    return this.structureModel
      .findOneAndUpdate(
        { id: structureId },
        { $push: { users: user } },
        { new: true }
      )
      .exec();
  }

  public async findAllPublic(codePostal?: string) {
    const params: StructureQuery = {
      verified: true,
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

    structure.users.forEach((user: any) => {
      return this.userModel
        .deleteOne({
          id: user.id,
          structureId: user.structureId,
        })
        .exec();
    });

    return this.structureModel.deleteOne({
      token,
    });
  }

  public async importSuccess(id: number) {
    return this.structureModel
      .findOneAndUpdate(
        { id },
        { $set: { import: true, importDate: new Date() } },
        { new: true }
      )
      .exec();
  }

  public async hardReset(id: number, token: any) {
    return this.structureModel
      .findOneAndUpdate({ id }, { $set: { hardReset: token } }, { new: true })
      .exec();
  }

  public async hardResetClean(structureId: string) {
    return this.structureModel
      .findOneAndUpdate(
        { _id: structureId },
        {
          $set: {
            hardReset: {
              token: "",
              expireAt: null,
            },
          },
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
