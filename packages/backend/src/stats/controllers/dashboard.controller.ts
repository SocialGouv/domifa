import { Controller, Get, UseGuards } from "@nestjs/common";
import { AuthGuard } from "@nestjs/passport";

import { CurrentUser } from "../../auth/current-user.decorator";

import { InteractionsService } from "../../interactions/interactions.service";
import { StructuresService } from "../../structures/structures.service";
import { UsagersService } from "../../usagers/services/usagers.service";
import { UsersService } from "../../users/services/users.service";
import { User } from "../../users/user.interface";
import { StatsService } from "../services/stats.service";
import { DomifaGuard } from "../../auth/domifa.guard";

@UseGuards(AuthGuard("jwt"))
@UseGuards(DomifaGuard)
@Controller("dashboard")
export class DashboardController {
  constructor(
    private readonly statsService: StatsService,
    private readonly structureService: StructuresService,
    private readonly usersService: UsersService,
    private readonly usagersService: UsagersService,
    private readonly interactionsService: InteractionsService
  ) {}

  @Get("structures")
  public async structures(@CurrentUser() user: User) {
    // 1. Liste des structures
    return this.structureService.findAllDomifa();
  }
}
