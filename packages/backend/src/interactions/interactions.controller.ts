import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  UseGuards
} from "@nestjs/common";
import { AuthGuard } from "@nestjs/passport";
import { AccessGuard } from "../auth/access.guard";
import { CurrentUsager } from "../auth/current-usager.decorator";
import { CurrentUser } from "../auth/current-user.decorator";
import { RolesGuard } from "../auth/roles.guard";
import { Usager } from "../usagers/interfaces/usagers";
import { User } from "../users/user.interface";
import { InteractionDto } from "./interactions.dto";
import { InteractionsService } from "./interactions.service";

@UseGuards(AuthGuard("jwt"))
@Controller("interactions")
export class InteractionsController {
  constructor(private readonly interactionService: InteractionsService) {}

  @UseGuards(RolesGuard)
  @Get("stats-domifa/structures")
  public async statsByStructures(@CurrentUser() user: User) {
    return this.interactionService.stats();
  }

  @UseGuards(RolesGuard)
  @Get("stats-domifa/all")
  public async statsDomifa(@CurrentUser() user: User) {
    return this.interactionService.stats();
  }

  @UseGuards(AccessGuard)
  @Post(":id")
  public postInteraction(
    @Body() interactionDto: InteractionDto,
    @CurrentUser() user: User,
    @CurrentUsager() usager: Usager
  ) {
    return this.interactionService.create(usager, user, interactionDto);
  }

  @UseGuards(AccessGuard)
  @Get(":id/:limit")
  public getInteractions(
    @Param("limit") limit: number,
    @CurrentUser() user: User,
    @CurrentUsager() usager: Usager
  ) {
    return this.interactionService.find(usager.id, limit, user);
  }

  @UseGuards(AccessGuard)
  @Delete(":id/:interactionId")
  public deleteInteraction(
    @Param("interactionId") interactionId: string,
    @CurrentUser() user: User,
    @CurrentUsager() usager: Usager
  ) {
    return this.interactionService.delete(usager.id, interactionId, user);
  }
}
