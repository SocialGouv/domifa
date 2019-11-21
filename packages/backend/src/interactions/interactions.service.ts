import {
  HttpException,
  HttpStatus,
  Inject,
  Injectable,
  Logger
} from "@nestjs/common";
import { Model } from "mongoose";
import { Usager } from "../usagers/interfaces/usagers";
import { UsagersService } from "../usagers/services/usagers.service";
import { UsersService } from "../users/services/users.service";
import { User } from "../users/user.interface";
import { InteractionDto } from "./interactions.dto";
import { Interaction } from "./interactions.interface";

@Injectable()
export class InteractionsService {
  constructor(
    @Inject("INTERACTION_MODEL")
    private readonly interactionModel: Model<Interaction>,
    @Inject("USAGER_MODEL")
    private readonly usagerModel: Model<Usager>,
    private readonly usagersService: UsagersService
  ) {}

  public async create(
    usagerId: number,
    user: User,
    interactionDto: InteractionDto
  ): Promise<Usager> {
    const createdInteraction = new this.interactionModel(interactionDto);

    const usager: Usager = await this.usagersService.findById(
      usagerId,
      user.structureId
    );

    if (!usager || usager === null) {
      throw new HttpException("NOT_FOUND", HttpStatus.NOT_FOUND);
    }

    usager.lastInteraction[interactionDto.type] = new Date();
    usager.lastInteraction.dateInteraction = new Date();

    if (interactionDto.nbCourrier) {
      usager.lastInteraction.nbCourrier =
        usager.lastInteraction.nbCourrier + interactionDto.nbCourrier;
    }

    if (
      interactionDto.type === "courrierIn" &&
      typeof interactionDto.nbCourrier === "undefined"
    ) {
      usager.lastInteraction.nbCourrier = usager.lastInteraction.nbCourrier + 1;
    }

    if (
      interactionDto.type === "courrierOut" ||
      interactionDto.type === "recommandeOut"
    ) {
      usager.lastInteraction.nbCourrier = 0;
    }

    createdInteraction.userName = user.prenom + " " + user.nom;
    createdInteraction.userId = user.id;
    createdInteraction.usagerId = usagerId;
    createdInteraction.structureId = user.structureId;

    createdInteraction.dateInteraction = new Date();

    const savedInteraction = await createdInteraction.save();
    usager.interactions.push(savedInteraction);

    return this.usagerModel
      .findOneAndUpdate(
        {
          id: usagerId,
          structureId: user.structureId
        },
        {
          $push: { interaction: savedInteraction },
          $set: {
            lastInteraction: usager.lastInteraction
          }
        },
        {
          new: true
        }
      )
      .select("-docsPath -interactions")
      .exec();
  }

  public async find(usagerId: number, limit: number, user: User): Promise<any> {
    return this.interactionModel
      .find({
        structureId: user.structureId,
        usagerId
      })
      .limit(12)
      .sort({ dateInteraction: -1 })
      .lean()
      .exec();
  }

  public async delete(
    usagerId: number,
    interactionId: string,
    user: User
  ): Promise<any> {
    return this.interactionModel
      .deleteOne({
        _id: interactionId,
        structureId: user.structureId,
        usagerId
      })
      .exec();
  }
}
