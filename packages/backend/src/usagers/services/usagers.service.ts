import { Inject, Injectable, Logger, HttpException } from "@nestjs/common";
import { Model, NativeError } from "mongoose";
import { User } from "../../users/user.interface";
import { DecisionDto } from "../dto/decision.dto";
import { EntretienDto } from "../dto/entretien.dto";
import { RdvDto } from "../dto/rdv.dto";
import { SearchDto } from "../dto/search.dto";
import { UsagersDto } from "../dto/usagers.dto";
import { Decision } from "../interfaces/decision";
import { SearchQuery } from "../interfaces/search-query";
import { Usager } from "../interfaces/usagers";
import { of } from "rxjs";
import { AyantDroit } from "../interfaces/ayant-droit";

@Injectable()
export class UsagersService {
  constructor(
    @Inject("USAGER_MODEL") private readonly usagerModel: typeof Model
  ) {}

  public async debug(): Promise<any> {
    const count = await this.usagerModel
      .countDocuments({
        ayantsDroits: { $exists: true, $not: { $size: 0 } },
        $or: [
          {
            migration: { $exists: false },
          },
          {
            migration: false,
          },
        ],
      })

      .exec();

    Logger.log("");
    Logger.log(count);
    Logger.log("");

    this.usagerModel
      .findOne({
        ayantsDroits: { $exists: true, $not: { $size: 0 } },
        $or: [
          {
            migration: { $exists: false },
          },
          {
            migration: false,
          },
        ],
      })
      .lean()
      .exec((err: any, usager: Usager) => {
        Logger.log("");
        Logger.log(usager.id);
        Logger.log(usager.nom + " - " + usager.ayantsDroits.length);

        for (let index = 0; index <= usager.ayantsDroits.length; index++) {
          const ayantDroit = usager.ayantsDroits[index];
          if (index === usager.ayantsDroits.length) {
            Logger.log("  ");
            Logger.log("-  ");
            Logger.log(usager.ayantsDroits);
            Logger.log("-  ");
            Logger.log("  ");

            usager.migration = true;

            this.usagerModel
              .findOneAndUpdate({ _id: usager._id }, { $set: usager })
              .select("-docsPath -interactions")
              .exec((_err: NativeError, ret: any) => {
                this.debug();
              });
            return;
          }

          if (
            typeof Date.parse(usager.ayantsDroits[index].dateNaissance) ===
            "undefined"
          ) {
            usager.ayantsDroits[index].dateNaissance = this.convertDate(
              ayantDroit.dateNaissance
            );
          }
        }
      });
    return of(true);
  }

  public async create(usagersDto: UsagersDto, user: User): Promise<Usager> {
    const createdUsager = new this.usagerModel(usagersDto);

    createdUsager.decision.userName = user.prenom + " " + user.nom;
    createdUsager.decision.userId = user.id;
    createdUsager.decision.dateDecision = new Date();

    createdUsager.structureId = user.structureId;
    createdUsager.etapeDemande++;
    createdUsager.id = await this.findLast(user.structureId);
    createdUsager.customId = createdUsager.id;

    return createdUsager.save();
  }

  public async patch(update: any, usagerId: string): Promise<Usager> {
    return this.usagerModel
      .findOneAndUpdate({ _id: usagerId }, { $set: update }, { new: true })
      .select("-docsPath -interactions")
      .exec();
  }

  public async nextStep(usagerId: string, etapeDemande: number) {
    return this.usagerModel
      .findOneAndUpdate(
        { _id: usagerId },
        {
          $set: { etapeDemande },
        },
        {
          new: true,
        }
      )
      .select("-docsPath -interactions")
      .exec();
  }

  public async renouvellement(usager: Usager, user: User) {
    const lastDecision = usager.decision;
    const decision = new DecisionDto();

    decision.dateDebut = new Date();
    decision.dateDecision = new Date();
    decision.statut = "INSTRUCTION";
    decision.userId = user.id;
    decision.userName = user.prenom + " " + user.nom;
    decision.typeDom = "RENOUVELLEMENT";

    usager.historique.push(lastDecision);
    usager.decision = decision;
    usager.etapeDemande = 0;
    usager.typeDom = "RENOUVELLEMENT";
    usager.decision.typeDom = "RENOUVELLEMENT";

    return this.usagerModel
      .findOneAndUpdate({ _id: usager._id }, { $set: usager }, { new: true })
      .select("-docsPath -interactions")
      .exec();
  }

  public async setEntretien(
    usagerId: number,
    entretienForm: EntretienDto
  ): Promise<Usager> {
    return this.usagerModel
      .findOneAndUpdate(
        { _id: usagerId },
        {
          $set: {
            entretien: entretienForm,
            etapeDemande: 3,
          },
        },
        {
          new: true,
        }
      )
      .select("-docsPath -interactions")
      .exec();
  }

  public async setRdv(
    usagerId: number,
    rdvDto: RdvDto,
    user: User
  ): Promise<Usager> {
    return this.usagerModel
      .findOneAndUpdate(
        {
          id: usagerId,
          structureId: user.structureId,
        },
        {
          $set: {
            etapeDemande: 2,
            "rdv.dateRdv": rdvDto.dateRdv,
            "rdv.userId": rdvDto.userId,
            "rdv.userName": user.nom + " " + user.prenom,
          },
        },
        {
          new: true,
        }
      )
      .select("-docsPath")
      .exec();
  }

  public async findById(id: number, structureId: number): Promise<Usager> {
    return this.usagerModel
      .findOne({
        id,
        structureId,
      })
      .populate("structure")
      .exec();
  }

  public async delete(usagerId: string): Promise<any> {
    return this.usagerModel.deleteOne({ _id: usagerId }).exec();
  }

  public async deleteAll(structureId: number): Promise<any> {
    return this.usagerModel.deleteMany({ structureId }).exec();
  }

  public async isDoublon(
    nom: string,
    prenom: string,
    user: User
  ): Promise<any> {
    return this.usagerModel
      .find({
        $and: [
          {
            nom: { $regex: nom, $options: "-i" },
          },
          {
            prenom: { $regex: prenom, $options: "-i" },
          },
        ],
        structureId: user.structureId,
      })
      .lean()
      .exec();
  }

  public async search(query: any, sort: any, page: number): Promise<any> {
    return this.usagerModel
      .find(query)
      .collation({ locale: "en" })
      .sort(sort)
      .select(
        "-createdAt -updatedAt -rdv -structureId -dateNaissance -villeNaissance -import -phone -email -datePremiereDom -docsPath -interactions -preference -ayantsDroits -historique -entretien -docs -ayantsDroits -etapeDemande"
      )
      .limit(40)
      .skip(page && page !== 0 ? 40 * page : 0)
      .lean()
      .exec();
  }

  public async count(query: any): Promise<any> {
    return this.usagerModel
      .countDocuments(query)
      .collation({ locale: "en" })
      .exec();
  }

  public async save(data: any, user: User) {
    const createdUsager = new this.usagerModel(data);
    createdUsager.id = await this.findLast(user.structureId);
    createdUsager.customId =
      data.customId === null ? createdUsager.id.toString() : data.customId;
    return createdUsager.save();
  }

  public async getStatsByStructure(structureId?: number) {
    const query = structureId ? { structureId: { $eq: structureId } } : {};

    return this.usagerModel
      .aggregate([
        { $match: query },
        {
          $group: {
            _id: { structureId: "$structureId", statut: "$decision.statut" },
            statuts: { $push: "$decision.statut" },
            total: { $sum: 1 },
          },
        },
        {
          $group: {
            _id: { structureId: "$_id.structureId" },
            statut: { $addToSet: { statut: "$_id.statut", sum: "$total" } },
          },
        },
      ])
      .exec();
  }

  public async getStats() {
    return this.usagerModel
      .aggregate([
        { $match: {} },
        {
          $group: {
            _id: { statut: "$decision.statut" },
            statuts: { $push: "$decision.statut" },
            total: { $sum: 1 },
          },
        },
        {
          $group: {
            _id: { statut: "$_id.statut" },
            sum: { $addToSet: "$total" },
          },
        },
      ])
      .exec();
  }

  public async findLast(structureId: number): Promise<number> {
    const lastUsager: any = await this.usagerModel
      .findOne({ structureId }, { id: 1 })
      .sort({ id: -1 })
      .lean()
      .exec();

    return lastUsager === {} || lastUsager === null ? 1 : lastUsager.id + 1;
  }

  private convertDate(dateFr: string) {
    // Logger.log("");
    // Logger.log("DATE FR");
    // Logger.log(dateFr);
    // Logger.log("");
    const dateParts = dateFr.split("/");
    const dateEn = `${dateParts[2]}-${dateParts[1]}-${dateParts[0]}`;
    const newDate = new Date(dateEn).toISOString();
    return newDate;
  }
}
