import { Inject, Injectable, Logger } from '@nestjs/common';
import { Model } from 'mongoose';
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

  public async create(usagerId: number, usagersDto: InteractionDto): Promise<Interaction> {

    const createdInteraction = new this.interactionModel(usagersDto);
    const user = await this.usersService.findById(2);
    const usager = await this.usagersService.findById(usagerId);

    createdInteraction.userName = user.firstName + ' ' + user.lastName;
    const savedInteraction = await createdInteraction.save();
    usager.lastInteraction = savedInteraction;
    return savedInteraction;
  }

}
