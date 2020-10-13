import { Inject, Injectable, Logger } from "@nestjs/common";
import { Model, NativeError } from "mongoose";
import { User } from "../../users/user.interface";
import { DecisionDto } from "../dto/decision.dto";
import { EntretienDto } from "../dto/entretien.dto";
import { RdvDto } from "../dto/rdv.dto";
import { CreateUsagerDto } from "../dto/create-usager.dto";
import { Usager } from "../interfaces/usagers";
import { of } from "rxjs";

@Injectable()
export class UsagersService {
  constructor(
    @Inject("USAGER_MODEL") private readonly usagerModel: typeof Model
  ) {}

  private async debug(): Promise<any> {
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

  public async create(usagerDto: CreateUsagerDto, user: User): Promise<Usager> {
    const createdUsager = new this.usagerModel(usagerDto);

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

  public async renouvellement(usager: Usager, user: User): Promise<Usager> {
    usager.historique.push(usager.decision);
    const decision = new DecisionDto();

    decision.dateDebut = new Date();
    decision.dateDecision = new Date();
    decision.statut = "INSTRUCTION";
    decision.userId = user.id;
    decision.userName = user.prenom + " " + user.nom;
    decision.typeDom = "RENOUVELLEMENT";

    return this.usagerModel
      .findOneAndUpdate(
        { _id: usager._id },
        {
          $set: {
            "options.npai.actif": false,
            "options.npai.dateDebut": null,
            decision,
            historique: usager.historique,
            etapeDemande: 0,
            typeDom: "RENOUVELLEMENT",
          },
        },
        { new: true }
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

  public async setDecision(
    usagerId: string,
    decision: DecisionDto,
    usager: Usager
  ): Promise<Usager> {
    return this.usagerModel
      .findOneAndUpdate(
        { _id: usagerId },
        {
          $set: {
            lastInteraction: usager.lastInteraction,
            decision,
            "entretien.rattachement": usager.entretien.rattachement,
            historique: usager.historique,
            typeDom: usager.typeDom,
            datePremiereDom: usager.datePremiereDom,
            etapeDemande: 6,
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
    usagerId: number,
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
        id: { $ne: usagerId },
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
        "-createdAt -updatedAt -rdv -structureId -dateNaissance -villeNaissance -import -phone -email -datePremiereDom -docsPath -interactions -preference -historique -entretien -docs"
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

  public async export(structureId: number): Promise<Usager[]> {
    return this.usagerModel
      .find({ structureId })
      .select(
        "-rdv -structureId -import -docsPath -interactions -preference -historique -docs -etapeDemande"
      )
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

  public async agenda(user: User) {
    return this.usagerModel
      .find({ "rdv.dateRdv": { $gte: new Date() }, "rdv.userId": user.id })
      .sort({ "rdv.dateRdv": -1 })
      .select("nom prenom id rdv")
      .lean()
      .exec();
  }

  private convertDate(dateFr: string) {
    const dateParts = dateFr.split("/");
    const dateEn = `${dateParts[2]}-${dateParts[1]}-${dateParts[0]}`;
    const newDate = new Date(dateEn).toISOString();
    return newDate;
  }
}
