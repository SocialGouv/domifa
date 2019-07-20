import {
  HttpException,
  HttpStatus,
  Inject,
  Injectable,
  Logger
} from "@nestjs/common";
import { Model } from "mongoose";
import { User } from "../../users/user.interface";
import { UsersService } from "../../users/users.service";
import { EntretienDto } from "../dto/entretien";
import { RdvDto } from "../dto/rdv";
import { SearchDto } from "../dto/search";
import { UsagersDto } from "../dto/usagers.dto";
import { Decision } from "../interfaces/decision";
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
    @Inject("USAGER_MODEL") private readonly usagerModel: typeof Model,
    private readonly usersService: UsersService
  ) {}

  public async create(usagersDto: UsagersDto): Promise<Usager> {
    const createdUsager = new this.usagerModel(usagersDto);
    const user = await this.usersService.findById(2);
    createdUsager.etapeDemande++;
    createdUsager.decision.dateInstruction = new Date();
    createdUsager.decision.userInstructionName = user.prenom + " " + user.nom;
    createdUsager.decision.userInstructionId = 2;

    createdUsager.id = await this.findLast();

    return createdUsager.save();
  }

  public async patch(usagersDto: UsagersDto): Promise<Usager> {
    if (!isNaN(usagersDto.etapeDemande)) {
      usagersDto.etapeDemande++;
    }
    return this.usagerModel
      .findOneAndUpdate(
        {
          id: usagersDto.id
        },
        {
          $set: usagersDto
        },
        {
          new: true
        }
      )
      .select("-docsPath")
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
      .select("-docsPath")
      .populate("interactions")
      .exec();
  }

  public async setDecision(
    usagerId: number,
    decisionSent: Decision
  ): Promise<Usager> {
    const user = await this.usersService.findById(2);
    const agent = user.prenom + " " + user.nom;

    if (decisionSent.statut === "demande") {
      decisionSent.dateDemande = new Date();
      decisionSent.userInstructionId = 2;
      decisionSent.userInstructionName = agent;
      /* Mail au responsable */
    }

    if (decisionSent.statut === "valide" || decisionSent.statut === "refus") {
      decisionSent.userDecisionId = 2;
      decisionSent.userDecisionName = agent;
      decisionSent.dateDebut = new Date();
      /* Récupération du dernier ID lié à la structure */
      /* SMS & Mail pr prévenir */
    }

    if (decisionSent.statut === "valide") {
      decisionSent.dateFin = new Date(
        new Date().setFullYear(new Date().getFullYear() + 1)
      );
    }

    return this.usagerModel
      .findOneAndUpdate(
        {
          id: usagerId
        },
        {
          $set: {
            decision: decisionSent,
            etapeDemande: 6
          }
        },
        {
          new: true
        }
      )
      .select("-docsPath")
      .exec();
  }

  public async setEntretien(
    usagerId: number,
    entretienForm: EntretienDto
  ): Promise<Usager> {
    return this.usagerModel
      .findOneAndUpdate(
        {
          id: usagerId
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
    /* GET USER NAME ID */
    return this.usagerModel
      .findOneAndUpdate(
        {
          id: usagerId
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

  public async deleteDocument(usagerId: number, index): Promise<Usager> {
    const usager = await this.usagerModel.findOne({ id: usagerId }).exec();
    const newDocs = usager.docs;
    const newDocsPath = usager.docsPath;
    newDocs.splice(parseInt(index, 2), 1);
    newDocsPath.splice(parseInt(index, 2), 1);

    /* GET USER NAME ID */
    return this.usagerModel
      .findOneAndUpdate(
        { id: usagerId },
        {
          $set: {
            docs: usager.docs,
            docsPath: usager.docsPath
          }
        },
        {
          new: true
        }
      )
      .exec();
  }

  public async addDocument(
    usagerId: number,
    filename: string,
    filetype: string,
    label: string
  ): Promise<Usager> {
    const usager = await this.usagerModel
      .findOne({
        id: usagerId
      })
      .exec();

    usager.docs.push({
      createdAt: new Date(),
      createdBy: "Yassine",
      filetype,
      label
    });

    usager.docsPath.push(filename);

    /* GET USER NAME ID */
    return this.usagerModel
      .findOneAndUpdate(
        { id: usagerId },
        {
          $set: {
            docs: usager.docs,
            docsPath: usager.docsPath
          }
        },
        { new: true }
      )
      .select("-docsPath")
      .exec();
  }

  public async getDocument(usagerId: number, index: number): Promise<any> {
    const usager = await this.usagerModel
      .findOne({
        id: usagerId
      })
      .exec();
    if (
      typeof usager.docs[index] === "undefined" ||
      typeof usager.docsPath[index] === "undefined"
    ) {
      return null;
    }

    const fileInfos = usager.docs[index];
    fileInfos.path = usager.docsPath[index];
    return fileInfos;
  }

  public async findAll(): Promise<Usager[]> {
    return this.usagerModel.find().exec();
  }

  public async findById(usagerId: number): Promise<Usager> {
    return this.usagerModel
      .findOne({
        id: usagerId
      })
      .select("-docsPath")
      .exec();
  }

  public async deleteById(usagerId: number): Promise<any> {
    return this.usagerModel
      .deleteOne({
        id: usagerId
      })
      .exec();
  }

  public async isDoublon(nom: string, prenom: string): Promise<Usager[]> {
    return this.usagerModel
      .find({
        $and: [
          {
            nom: { $regex: nom, $options: "-i" }
          },
          {
            prenom: { $regex: prenom, $options: "-i" }
          }
        ]
      })
      .lean()
      .exec();
  }

  public async search(query?: SearchDto): Promise<Usager[]> {
    this.sort = { nom: 1 };
    this.searchQuery = {};
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
