import { Controller, Get, Param } from "@nestjs/common";
import { ApiTags } from "@nestjs/swagger";
import {
  structureRepository,
  usagerRepository,
  userStructureRepository
} from "../../database";
import { PublicStats } from "../../_common/model";
import { AdminStructuresService } from "../../_portail-admin/admin-structures/services";
import { StructuresService } from "./../../structures/services/structures.service";

@Controller("stats")
@ApiTags("stats")
// ATTENTION: controller non-sécurisé: ajouter les routes à sécuriser dans StatsPrivateController
export class StatsPublicController {
  public sheet: {
    [key: string]: {};
  }[];

  constructor(
    private readonly adminStructuresService: AdminStructuresService,
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
      interactions: await this.adminStructuresService.totalInteractions(
        "courrierIn"
      ),
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
        await this.adminStructuresService.getStructuresCountByDepartement(
          regionId
        );

      publicStats.structuresCount = structures.length;

      publicStats.usersCount =
        await userStructureRepository.countUsersByRegionId({ regionId });
    } else {
      publicStats.structuresCount =
        await this.adminStructuresService.countStructures();

      publicStats.structuresCountByRegion =
        await this.adminStructuresService.getStructuresCountByRegion();

      publicStats.usersCount = await userStructureRepository.count();
    }

    // Usagers
    const usagers = await usagerRepository.countUsagers(structures);
    const ayantsDroits = await usagerRepository.countAyantsDroits(structures);

    publicStats.usagersCount = usagers + ayantsDroits;

    publicStats.interactionsCount =
      await this.adminStructuresService.totalInteractions(
        "courrierOut",
        structures
      );

    publicStats.structuresCountByTypeMap =
      await this.adminStructuresService.getStructuresCountByTypeMap(regionId);

    publicStats.interactionsCountByMonth =
      await this.adminStructuresService.countInteractionsByMonth(regionId);

    publicStats.usagersCountByMonth =
      await this.adminStructuresService.countUsagersByMonth(regionId);

    return publicStats;
  }
}
