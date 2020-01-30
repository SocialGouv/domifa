import { Inject, Injectable, Logger } from "@nestjs/common";
import { Model } from "mongoose";
import { User } from "../../users/user.interface";
import { DecisionDto } from "../dto/decision.dto";
import { EntretienDto } from "../dto/entretien.dto";
import { RdvDto } from "../dto/rdv.dto";
import { SearchDto } from "../dto/search.dto";
import { TransfertDto } from "../dto/transfert.dto";
import { UsagersDto } from "../dto/usagers.dto";
import { Decision } from "../interfaces/decision";
import { SearchQuery } from "../interfaces/search-query";
import { Usager } from "../interfaces/usagers";

@Injectable()
export class UsagersService {
  constructor(
    @Inject("USAGER_MODEL") private readonly usagerModel: typeof Model
  ) {}

  public async create(usagersDto: UsagersDto, user: User): Promise<Usager> {
    const createdUsager = new this.usagerModel(usagersDto);

    createdUsager.decision.userName = user.prenom + " " + user.nom;
    createdUsager.decision.userId = user.id;
    createdUsager.decision.dateDecision = new Date();

    createdUsager.structureId = user.structureId;
    createdUsager.etapeDemande++;
    createdUsager.id = await this.findLast(user.structureId);
    return createdUsager.save();
  }

  public async patch(update: any, usagerId: string): Promise<Usager> {
    return this.usagerModel
      .findOneAndUpdate(
        {
          _id: usagerId
        },
        {
          $set: update
        },
        {
          new: true
        }
      )
      .select("-docsPath -interactions")
      .exec();
  }

  public async nextStep(usagerId: string, etapeDemande: number) {
    return this.usagerModel
      .findOneAndUpdate(
        { _id: usagerId },
        {
          $set: { etapeDemande }
        },
        {
          new: true
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

    return this.usagerModel
      .findOneAndUpdate(
        { _id: usager._id },
        {
          $push: {
            historique: lastDecision
          },
          $set: {
            decision,
            etapeDemande: 0,
            typeDom: "RENOUVELLEMENT"
          }
        },
        {
          new: true
        }
      )
      .select("-docsPath -interactions")
      .exec();
  }

  public async setDecision(
    usagerId: number,
    structureId: number,
    decision: DecisionDto,
    lastDecision: Decision
  ): Promise<Usager> {
    return this.usagerModel
      .findOneAndUpdate(
        {
          id: usagerId,
          structureId
        },
        {
          $push: { historique: lastDecision },
          $set: {
            decision,
            etapeDemande: 6
          }
        },
        {
          new: true
        }
      )
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
            etapeDemande: 3
          }
        },
        {
          new: true
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
          structureId: user.structureId
        },
        {
          $set: {
            etapeDemande: 2,
            "rdv.dateRdv": rdvDto.dateRdv,
            "rdv.userId": rdvDto.userId,
            "rdv.userName": user.nom + " " + user.prenom
          }
        },
        {
          new: true
        }
      )
      .select("-docsPath")
      .exec();
  }

  public async findById(id: number, structureId: number): Promise<Usager> {
    return this.usagerModel
      .findOne({
        id,
        structureId
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
            nom: { $regex: nom, $options: "-i" }
          },
          {
            prenom: { $regex: prenom, $options: "-i" }
          }
        ],
        structureId: user.structureId
      })
      .lean()
      .exec();
  }

  public async search(query: SearchDto, structureId: number): Promise<any> {
    let sort: any = { nom: 1 };
    const searchQuery: SearchQuery = {};

    searchQuery.structureId = structureId;

    const sortValues: {
      [key: string]: {};
    } = {
      az: { nom: "ascending" },
      domiciliation: { "decision.dateDebut": "ascending" },
      radiation: { "decision.dateFin": "descending" },
      za: { nom: "descending" }
    };

    /* ID DE LA STRUCTURE DE LUSER */
    if (query.name) {
      searchQuery.$or = [
        {
          nom: { $regex: ".*" + query.name + ".*", $options: "-i" }
        },
        {
          prenom: { $regex: ".*" + query.name + ".*", $options: "-i" }
        },
        {
          surnom: { $regex: ".*" + query.name + ".*", $options: "-i" }
        }
      ];
    }

    if (query.statut) {
      searchQuery["decision.statut"] = query.statut;
    }

    if (query.interactionType) {
      searchQuery["lastInteraction.nbCourrier"] = { $gt: 0 };
    }

    if (query.sort) {
      sort = sortValues[query.sort];
    }

    return this.usagerModel
      .find(searchQuery)
      .collation({ locale: "en" })
      .sort(sort)
      .select(
        "-structureId -dateNaissance -villeNaissance -import -phone -email -datePremiereDom -docsPath -interactions -preference -ayantsDroits -historique -entretien -docs -ayantsDroits -etapeDemande"
      )
      .lean()
      .exec();
  }

  public async save(data: any, user: User) {
    const createdUsager = new this.usagerModel(data);
    createdUsager.id = await this.findLast(user.structureId);
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
            total: { $sum: 1 }
          }
        },
        {
          $group: {
            _id: { structureId: "$_id.structureId" },
            statut: { $addToSet: { statut: "$_id.statut", sum: "$total" } }
          }
        }
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
            total: { $sum: 1 }
          }
        },
        {
          $group: {
            _id: { statut: "$_id.statut" },
            sum: { $addToSet: "$total" }
          }
        }
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
}
