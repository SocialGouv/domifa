import { Body, Controller, Logger, Param, Post } from '@nestjs/common';
import { InteractionDto } from './interactions.dto';
import { InteractionsService } from './interactions.service';

@Controller('interactions')
export class InteractionsController {
  private readonly logger = new Logger(InteractionsController.name);

  constructor(private readonly interactionService: InteractionsService) {

  }

  @Post(':usagerId')
  public postInteraction(@Param('usagerId') usagerId: number, @Body() interactionDto: InteractionDto) {
    this.logger.log("POST INTERACTION");
    return this.interactionService.create(usagerId, interactionDto);
  }
}
