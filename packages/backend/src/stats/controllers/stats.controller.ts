import { Controller, Get, UseGuards } from "@nestjs/common";
import { AuthGuard } from "@nestjs/passport";

import { CurrentUser } from "../../auth/current-user.decorator";
import { RolesGuard } from "../../auth/roles.guard";
import { InteractionsService } from "../../interactions/interactions.service";
import { StructuresService } from "../../structures/structures.service";
import { UsagersService } from "../../usagers/services/usagers.service";
import { UsersService } from "../../users/services/users.service";
import { User } from "../../users/user.interface";
import { StatsService } from "../services/stats.service";

@Controller("stats")
export class StatsController {
  constructor(
    private readonly statsService: StatsService,
    private readonly structureService: StructuresService,
    private readonly usersService: UsersService,
    private readonly usagersService: UsagersService,
    private readonly interactionsService: InteractionsService
  ) {}
  @UseGuards(AuthGuard("jwt"))
  @UseGuards(RolesGuard)
  @Get("today")
  public async today(@CurrentUser() user: User) {
    return this.statsService.getToday(user.structureId);
  }

  @Get("force-regenerate")
  public async generate() {
    return this.statsService.clean();
  }
}
