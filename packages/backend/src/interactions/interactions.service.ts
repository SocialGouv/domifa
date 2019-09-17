import {
  HttpException,
  HttpStatus,
  Inject,
  Injectable,
  Logger,
  UseGuards
} from "@nestjs/common";
import { Model } from "mongoose";
import { Usager } from "../usagers/interfaces/usagers";
import { UsagersService } from "../usagers/services/usagers.service";
import { User } from "../users/user.interface";
import { UsersService } from "../users/users.service";
import { InteractionDto } from "./interactions.dto";
import { Interaction } from "./interactions.interface";

@Injectable()
export class InteractionsService {
  private readonly logger = new Logger(InteractionsService.name);

  constructor(
    @Inject("INTERACTION_MODEL")
    private readonly interactionModel: Model<Interaction>,
    private readonly usagersService: UsagersService,
    private readonly usersService: UsersService
  ) {}

  public async create(
    usagerId: number,
    user: User,
    interactionDto: InteractionDto
  ): Promise<Usager> {
    const createdInteraction = new this.interactionModel(interactionDto);

    const usager = await this.usagersService.findById(
      usagerId,
      user.structureId
    );

    if (!usager || usager === null) {
      throw new HttpException("NOT_FOUND", HttpStatus.NOT_FOUND);
    }

    usager.lastInteraction[interactionDto.type] = new Date();

    if (interactionDto.nbCourrier) {
      usager.lastInteraction.nbCourrier =
        usager.lastInteraction.nbCourrier + interactionDto.nbCourrier;
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

    const toUpdate = {
      interactions: usager.interactions,
      lastInteraction: usager.lastInteraction
    };
    return this.usagersService.updateUsager(usagerId, toUpdate);
  }

  public async find(
    usagerId: number,
    limit: number,
    user: User
  ): Promise<Usager> {
    return this.interactionModel
      .find({
        structureId: user.structureId,
        usagerId
      })
      .limit(20)
      .lean()
      .exec();
  }
}
