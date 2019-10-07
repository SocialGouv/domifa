import { Inject, Injectable, Logger } from "@nestjs/common";
import { Model } from "mongoose";
import { User } from "../../users/user.interface";
import { DecisionDto } from "../dto/decision.dto";
import { EntretienDto } from "../dto/entretien";
import { RdvDto } from "../dto/rdv";
import { SearchDto } from "../dto/search";
import { UsagersDto } from "../dto/usagers.dto";
import { SearchQuery } from "../interfaces/search-query";
import { Usager } from "../interfaces/usagers";

@Injectable()
export class UsagersService {
  public limit: number;
  public sort: {};
  public searchByName: {};
  public searchQuery: SearchQuery;
  private readonly logger = new Logger(UsagersService.name);

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
    createdUsager.id = await this.findLast();
    return createdUsager.save();
  }

  public async patch(usagersDto: UsagersDto, user: User): Promise<Usager> {
    return this.usagerModel
      .findOneAndUpdate(
        {
          id: usagersDto.id,
          structureId: user.structureId
        },
        {
          $set: usagersDto
        },
        {
          new: true
        }
      )
      .select("-docsPath -interactions")
      .exec();
  }

  public async updateUsager(usagerId: number, toUpdate: any) {
    return this.usagerModel
      .findOneAndUpdate(
        { id: usagerId },
        {
          $set: toUpdate
        },
        {
          new: true
        }
      )
      .select("-docsPath -interactions")
      .exec();
  }

  public async setDecision(
    usager: Usager,
    decision: DecisionDto,
    user: User
  ): Promise<Usager> {
    decision.userName = user.prenom + " " + user.nom;
    decision.userId = user.id;
    decision.dateDecision = new Date();

    const lastDecision = usager.decision;

    if (decision.statut === "ATTENTE_DECISION") {
      /* Mail au responsable */
    }

    if (decision.statut === "REFUS") {
      /* Récupération du dernier ID lié à la structure */
      /* SMS & Mail pr prévenir */
      decision.dateDebut = lastDecision.dateDebut;
      decision.dateFin = new Date();
    }

    if (decision.statut === "RADIE") {
      decision.dateDebut = lastDecision.dateDebut;
      decision.dateFin = new Date();
    }

    if (decision.statut === "VALIDE") {
      /* Récupération du dernier ID lié à la structure */
      /* SMS & Mail pr prévenir */
      if (!usager.datePremiereDom) {
        usager.typeDecision = "RENOUVELLEMENT";
      }
      if (decision.dateFin !== undefined && decision.dateFin !== null) {
        decision.dateFin = new Date(decision.dateFin);
      } else {
        decision.dateFin = new Date(
          new Date().setFullYear(new Date().getFullYear() + 1)
        );
      }
      decision.dateDebut = new Date(decision.dateDebut);
    }

    return this.usagerModel
      .findOneAndUpdate(
        {
          id: usager.id,
          structureId: user.structureId
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
    entretienForm: EntretienDto,
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
            entretien: entretienForm,
            etapeDemande: 3
          }
        },
        {
          new: true
        }
      )
      .select("-docsPath")
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

  public async findAll(): Promise<Usager[]> {
    return this.usagerModel.find().exec();
  }

  public async findById(
    id: number,
    structureId: number,
    select?: string
  ): Promise<Usager> {
    const selectedFields = !select ? "-docsPath" : "";
    return this.usagerModel
      .findOne({
        id,
        structureId
      })
      .select(selectedFields)
      .exec();
  }

  public async delete(usagerId: number, user: User): Promise<any> {
    return this.usagerModel
      .deleteOne({
        id: usagerId,
        structureId: user.structureId
      })
      .exec();
  }

  public async isDoublon(
    nom: string,
    prenom: string,
    user: User
  ): Promise<Usager[]> {
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

  public async search(
    query: SearchDto,
    structureId: number
  ): Promise<Usager[]> {
    this.sort = { nom: 1 };
    this.searchQuery = {};
    this.searchQuery.structureId = structureId;

    const sortValues = {
      az: { nom: "ascending" },
      domiciliation: { "decision.dateDebut": "ascending" },
      radiation: { "decision.dateFin": "descending" },
      za: { nom: "descending" }
    };

    /* ID DE LA STRUCTURE DE LUSER */
    if (query.name) {
      this.searchQuery.$or = [
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
      this.searchQuery["decision.statut"] = query.statut;
    }

    if (query.interactionType) {
      this.searchQuery["lastInteraction.nbCourrier"] = { $gt: 0 };
    }

    if (query.sort) {
      this.sort = sortValues[query.sort];
    }

    return this.usagerModel
      .find(this.searchQuery)
      .collation({ locale: "en" })
      .sort(this.sort)
      .lean()
      .exec();
  }

  public async save(data: any) {
    const createdUsager = new this.usagerModel(data);
    createdUsager.id = await this.findLast();
    return createdUsager.save();
  }

  public async findLast(): Promise<number> {
    try {
      const lastUser = await this.usagerModel
        .findOne({}, { id: 1 })
        .sort({ id: -1 })
        .lean()
        .exec();
      return lastUser.id === undefined ? 1 : lastUser.id + 1;
    } catch (e) {
      return 1;
    }
  }
}
