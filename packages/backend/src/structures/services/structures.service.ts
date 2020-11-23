import { HttpException, HttpStatus, Inject, Injectable } from "@nestjs/common";
import * as crypto from "crypto";
import { Model } from "mongoose";
import { appLogger } from "../../util";
import { AppUser } from "../../_common/model";
import { DepartementHelper } from "../departement-helper.service";
import { StructureEditDto } from "../dto/structure-edit.dto";
import { StructureDto } from "../dto/structure.dto";
import { Structure } from "../structure-interface";

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
    private departementHelper: DepartementHelper
  ) {}

  public async prePost(structureDto: StructureDto): Promise<any> {
    try {
      const departement = this.departementHelper.getDepartementFromCodePostal(
        structureDto.codePostal
      );
      this.departementHelper.getRegionCodeFromDepartement(departement);
    } catch (err) {
      appLogger.warn(
        `[StructuresService] error validating postal code "${structureDto.codePostal}"`
      );
      throw new HttpException("REGION_PROBLEM", HttpStatus.BAD_REQUEST);
    }

    return new this.structureModel(structureDto);
  }

  public async create(structureDto: StructureDto): Promise<any> {
    const createdStructure = new this.structureModel(structureDto);
    createdStructure.id = await this.findLast();
    createdStructure.token = crypto.randomBytes(30).toString("hex");

    createdStructure.departement = this.departementHelper.getDepartementFromCodePostal(
      createdStructure.codePostal
    );
    createdStructure.region = this.departementHelper.getRegionCodeFromDepartement(
      createdStructure.departement
    );

    const structure = await createdStructure.save();
    return structure;
  }

  public async patch(
    structureDto: StructureEditDto,
    user: Pick<AppUser, "structureId">
  ): Promise<any> {
    structureDto.departement = this.departementHelper.getDepartementFromCodePostal(
      structureDto.codePostal
    );
    structureDto.region = this.departementHelper.getRegionCodeFromDepartement(
      structureDto.departement
    );

    return this.structureModel
      .findOneAndUpdate(
        { _id: user.structureId },
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

  public async updateLastLogin(structureId: number): Promise<any> {
    return this.structureModel
      .findOneAndUpdate(
        { id: structureId },
        { $set: { lastLogin: new Date() } }
      )
      .exec();
  }

  public async checkToken(token: string, id: string): Promise<any> {
    return this.structureModel
      .findOneAndUpdate(
        { _id: id, token },
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
  public async findManyBasic(param: any): Promise<Structure[]> {
    const structure = await this.structureModel
      .find(param)
      .select("-users -token -email -phone -responsable")
      .exec();
    return structure;
  }

  public async checkHardResetToken(
    userId: number,
    token: string
  ): Promise<Structure | null> {
    return this.structureModel
      .findOne({ "hardReset.token": token, "hardReset.userId": userId })
      .select("+hardReset")
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

  public async delete(id: string): Promise<any> {
    return this.structureModel.deleteOne({ _id: id });
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

  public async generateDeleteToken(id: string) {
    const token = crypto.randomBytes(30).toString("hex");
    return this.structureModel
      .findOneAndUpdate({ _id: id }, { $set: { token } }, { new: true })
      .exec();
  }

  public async deleteAccount(id: string, tokenDelete: string) {
    return this.structureModel.deleteOne({ _id: id, tokenDelete }).exec();
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
