import { Controller, Get, Param } from "@nestjs/common";
import { ApiTags } from "@nestjs/swagger";
import { structureRepository, usagerRepository } from "../../database";
import { PublicStats } from "../../_common/model";
import { DashboardService } from "../services/dashboard.service";
import { StructuresService } from "./../../structures/services/structures.service";

import moment = require("moment");

@Controller("stats")
@ApiTags("stats")
// ATTENTION: controller non-sécurisé: ajouter les routes à sécuriser dans StatsPrivateController
export class StatsPublicController {
  public sheet: {
    [key: string]: {};
  }[];

  constructor(
    private readonly dashboardService: DashboardService,
    private readonly structuresService: StructuresService
  ) {
    this.sheet = [];
  }

  @Get("home-stats")
  public async home() {
    const usagers = await usagerRepository.count();
    const ayantsDroits = await usagerRepository.countAyantsDroits();

    const totalUsagers = usagers + ayantsDroits;

    const statsHome = {
      structures: await structureRepository.count(),
      interactions: await this.dashboardService.totalInteractions("courrierIn"),
      usagers: totalUsagers,
    };
    return statsHome;
  }

  @Get("public-stats/:regionId?")
  public async getPublicStats(@Param("regionId") regionId: string) {
    const publicStats: PublicStats = {
      courrierOutCount: 0,
      usagersCount: 0,
      usersCount: 0,
      structuresCount: 0,
      interactionsCount: 0,
    };

    // Si aucune region
    let structures = null;

    if (regionId) {
      structures = await this.structuresService.findStructuresInRegion(
        regionId
      );

      publicStats.structuresCountByDepartement =
        await this.dashboardService.getStructuresCountByDepartement(regionId);

      publicStats.structuresCount = structures.length;
    } else {
      publicStats.structuresCount =
        await this.dashboardService.countStructures();

      publicStats.structuresCountByRegion =
        await this.dashboardService.getStructuresCountByRegion();
    }

    // Usagers
    const usagers = await usagerRepository.countUsagers(structures);
    const ayantsDroits = await usagerRepository.countAyantsDroits(structures);

    publicStats.usagersCount = usagers + ayantsDroits;

    publicStats.usersCount = await this.dashboardService.countUsers(structures);

    publicStats.interactionsCount =
      await this.dashboardService.totalInteractions("courrierOut", structures);

    publicStats.structuresCountByTypeMap =
      await this.dashboardService.getStructuresCountByTypeMap(regionId);

    publicStats.interactionsCountByMonth =
      await this.dashboardService.countInteractionsByMonth(regionId);

    publicStats.usagersCountByMonth =
      await this.dashboardService.countUsagersByMonth(regionId);

    return publicStats;
  }
}
