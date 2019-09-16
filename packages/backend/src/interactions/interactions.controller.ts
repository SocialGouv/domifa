import {
  Body,
  Controller,
  Get,
  Logger,
  Param,
  Post,
  UseGuards
} from "@nestjs/common";
import { AuthGuard } from "@nestjs/passport";
import { CurrentUser } from "../users/current-user.decorator";
import { User } from "../users/user.interface";
import { InteractionDto } from "./interactions.dto";
import { InteractionsService } from "./interactions.service";

@UseGuards(AuthGuard("jwt"))
@Controller("interactions")
export class InteractionsController {
  private readonly logger = new Logger(InteractionsController.name);

  constructor(private readonly interactionService: InteractionsService) {}

  @Post(":usagerId")
  public postInteraction(
    @Param("usagerId") usagerId: number,
    @Body() interactionDto: InteractionDto,
    @CurrentUser() user: User
  ) {
    return this.interactionService.create(usagerId, user, interactionDto);
  }

  @Get(":usagerId/:type")
  public setPassage(
    @Param("usagerId") usagerId: number,
    @Param("type") type: string,
    @CurrentUser() user: User
  ) {
    const interaction = new InteractionDto();
    interaction.type = type;
    return this.interactionService.create(usagerId, user, interaction);
  }
}
