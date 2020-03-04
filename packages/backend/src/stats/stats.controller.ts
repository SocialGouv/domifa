import { Controller, Get } from "@nestjs/common";
import { InteractionsService } from "../interactions/interactions.service";
import { StructuresService } from "../structures/structures.service";
import { UsagersService } from "../usagers/services/usagers.service";
import { UsersService } from "../users/services/users.service";
import { Stats } from "./stats.class";
import { StatsService } from "./stats.service";

@Controller("stats")
export class StatsController {
  constructor(
    private readonly statsService: StatsService,
    private readonly structureService: StructuresService,
    private readonly usersService: UsersService,
    private readonly usagersService: UsagersService,
    private readonly interactionsService: InteractionsService
  ) {}

  @Get("generate")
  public async generate() {
    const structure = await this.structureService.findOne(17);

    const stat = new Stats();
    stat.capacite = structure.capacite;
    stat.structureId = structure.capacite;
    return stat;
  }
}
