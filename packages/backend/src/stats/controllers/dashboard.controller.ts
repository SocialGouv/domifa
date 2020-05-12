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
import { DashboardService } from "../services/dashboard.service";

@UseGuards(AuthGuard("jwt"))
@UseGuards(DomifaGuard)
@Controller("dashboard")
export class DashboardController {
  constructor(
    private readonly statsService: StatsService,
    private readonly dashboardService: DashboardService,
    private readonly structureService: StructuresService,
    private readonly usersService: UsersService,
    private readonly usagersService: UsagersService,
    private readonly interactionsService: InteractionsService
  ) {}

  // 1. Liste des structures
  @Get("structures")
  public async structures() {
    return this.dashboardService.getStructures();
  }

  // 2. Liste des structures par type
  @Get("structures/type")
  public async countByType() {
    const result = await this.dashboardService.getStructuresByType();
    const structures: { [key: string]: any } = {};
    let total = 0;
    for (const structure of result) {
      structures[structure.structureType] = structure.count;
      total += structure.count;
    }
    structures.total = total;
    return structures;
  }

  // 3. Les interactions
  @Get("interactions")
  public async getInteractions() {
    return this.dashboardService.getInteractions();
  }

  // 4. Total des users
  @Get("users")
  public async getUsers() {
    return this.dashboardService.getUsers();
  }

  // 5. Total des domiciliés actifs
  @Get("usagers/valide")
  public async getUsagersActifs() {
    const result = await this.dashboardService.getUsagersValide();
    const usagers: { [key: string]: any } = {};

    for (const usager of result) {
      usagers[usager.structureId] = usager.count;
    }
    return usagers;
  }

  @Get("usagers")
  public async getUsagerss() {
    return this.dashboardService.getUsagers();
  }
}
