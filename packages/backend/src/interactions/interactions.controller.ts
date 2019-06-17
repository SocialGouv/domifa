import { Body, Controller, Get, Logger, Param, Post } from "@nestjs/common";
import { InteractionDto } from "./interactions.dto";
import { InteractionsService } from "./interactions.service";

@Controller("interactions")
export class InteractionsController {
  private readonly logger = new Logger(InteractionsController.name);

  constructor(private readonly interactionService: InteractionsService) {}

  @Post(":usagerId")
  public postInteraction(
    @Param("usagerId") usagerId: number,
    @Body() interactionDto: InteractionDto
  ) {
    return this.interactionService.create(usagerId, interactionDto);
  }

  @Get(":usagerId/:type")
  public setPassage(
    @Param("usagerId") usagerId: number,
    @Param("type") type: string
  ) {
    const interaction = new InteractionDto();
    interaction.type = type;
    return this.interactionService.create(usagerId, interaction);
  }
}
