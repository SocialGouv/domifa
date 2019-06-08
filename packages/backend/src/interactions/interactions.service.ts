import { Inject, Injectable, Logger } from '@nestjs/common';
import { Model } from 'mongoose';
import { Usager } from '../usagers/interfaces/usagers';
import { UsagersService } from '../usagers/services/usagers.service';
import { UsersService } from '../users/users.service';
import { InteractionDto } from './interactions.dto';
import { Interaction } from './interactions.interface';

@Injectable()
export class InteractionsService {

  private readonly logger = new Logger(InteractionsService.name);


  constructor(@Inject('INTERACTION_MODEL') private readonly interactionModel: Model<Interaction>,
  private readonly usagersService: UsagersService,
  private readonly usersService: UsersService) {

  }

  public async create(usagerId: number, usagersDto: InteractionDto): Promise<Usager> {
    const createdInteraction = new this.interactionModel(usagersDto)
    const user = await this.usersService.findById(2);
    const usager = await this.usagersService.findById(usagerId);
    this.logger.log(usager);

    usager.lastInteraction[usagersDto.type] = new Date();

    if (usagersDto.nbCourrier) {
      this.logger.log(usager.lastInteraction.nbCourrier);
      usager.lastInteraction.nbCourrier = usager.lastInteraction.nbCourrier + usagersDto.nbCourrier;
      this.logger.log(usager.lastInteraction.nbCourrier);
      this.logger.log(usagersDto.nbCourrier);
    }

    if (usagersDto.type === 'courrierOut' || usagersDto.type === 'recommandeOut') {
      usager.lastInteraction.nbCourrier = 0;
    }

    createdInteraction.userName = user.firstName + ' ' + user.lastName;
    createdInteraction.userId = user.id;
    createdInteraction.dateInteraction = new Date();

    const savedInteraction = await createdInteraction.save();
    const interactions = usager.interactions === undefined ? usager.interactions = [] : usager.interactions.push(savedInteraction);

    const toUpdate = {
      "interactions": interactions,
      "lastInteraction": usager.lastInteraction,
    };
    return this.usagersService.updateUsager(usagerId, toUpdate)
  }
}
