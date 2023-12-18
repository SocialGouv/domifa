import { ParseRegionPipe } from "./../../_common/decorators/ParseRegion.pipe";
import { FranceRegion } from "./../../util/territoires/types/FranceRegion.type";
import { Controller, Get, Param } from "@nestjs/common";
import { ApiTags } from "@nestjs/swagger";
import {
  userStructureRepository,
  structureRepository,
  usagerRepository,
} from "../../database";
import { AdminStructuresService } from "../../_portail-admin/admin-structures/services";
import { StructuresService } from "./../../structures/services/structures.service";
import { HomeStats, PublicStats } from "@domifa/common";

@Controller("stats")
@ApiTags("stats")
export class StatsPublicController {
  constructor(
    private readonly adminStructuresService: AdminStructuresService,
    private readonly structuresService: StructuresService
  ) {}

  @Get("home")
  public async home(): Promise<HomeStats> {
    return {
      structures: await structureRepository.count(),
      interactions: await this.adminStructuresService.totalInteractions(
        "courrierIn"
      ),
      usagers: await usagerRepository.countTotalUsagers(),
    };
  }

  @Get("public-stats/:regionId?")
  public async getPublicStats(
    @Param("regionId", new ParseRegionPipe()) regionId: FranceRegion
  ): Promise<PublicStats> {
    return this.generatePublicStats(regionId);
  }

  private async generatePublicStats(
    regionId?: FranceRegion
  ): Promise<PublicStats> {
    const publicStats = new PublicStats();
    // Si aucune region
    let structures: number[] = null;

    if (regionId) {
      structures = await this.structuresService.findStructuresInRegion(
        regionId
      );

      // Si aucune structure dans la région, tous les indicateurs sont à zero
      if (!structures.length) {
        return publicStats;
      }

      publicStats.structuresCountByRegion =
        await this.adminStructuresService.getStructuresCountByDepartement(
          regionId
        );

      publicStats.structuresCount = structures.length;

      publicStats.usersCount =
        await userStructureRepository.countUsersByRegionId({ regionId });
    }
    // Stats nationales
    else {
      publicStats.structuresCount = await structureRepository.count();

      publicStats.structuresCountByRegion =
        await this.adminStructuresService.getStructuresCountByRegion();

      publicStats.usersCount = await userStructureRepository.count();
    }

    // Usagers
    publicStats.usagersCount = await usagerRepository.countTotalUsagers(
      structures
    );

    publicStats.courrierInCount =
      await this.adminStructuresService.totalInteractions(
        "courrierIn",
        structures
      );

    publicStats.courrierOutCount =
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
