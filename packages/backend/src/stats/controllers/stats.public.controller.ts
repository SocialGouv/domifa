import { FranceRegion } from "./../../util/territoires/types/FranceRegion.type";
import { HomeStats } from "./../../_common/model/stats/HomeStats.type";
import { Controller, Get, HttpStatus, Param, Res } from "@nestjs/common";
import { ApiTags } from "@nestjs/swagger";
import {
  newUserStructureRepository,
  structureRepository,
  usagerRepository,
  userStructureRepository,
} from "../../database";
import { DEFAULT_PUBLIC_STATS, PublicStats } from "../../_common/model";
import { AdminStructuresService } from "../../_portail-admin/admin-structures/services";
import { StructuresService } from "./../../structures/services/structures.service";
import { ExpressResponse } from "../../util/express";
import { FRANCE_REGION_CODES } from "../../util/territoires";

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
    @Param("regionId") regionId: FranceRegion,
    @Res() res: ExpressResponse
  ) {
    if (regionId && FRANCE_REGION_CODES.indexOf(regionId) === -1) {
      return res
        .status(HttpStatus.BAD_REQUEST)
        .json({ message: "REGION_NOT_EXISTS" });
    }

    return res
      .status(HttpStatus.OK)
      .json(await this.generatePublicStats(regionId));
  }

  private async generatePublicStats(
    regionId?: FranceRegion
  ): Promise<PublicStats> {
    const publicStats: PublicStats = {
      structuresCountByRegion: [],
      interactionsCountByMonth: [], // Par défaut: courriers distribués
      usagersCount: 0,
      usagersCountByMonth: [],
      usersCount: 0,
      interactionsCount: 0,
      structuresCount: 0,
      structuresCountByTypeMap: {
        asso: 0,
        ccas: 0,
        cias: 0,
      },
    };
    // Si aucune region
    let structures: number[] = null;

    if (regionId) {
      structures = await this.structuresService.findStructuresInRegion(
        regionId
      );

      // Si aucune structure dans la région, tous les indicateurs sont à zero
      if (!structures.length) {
        return DEFAULT_PUBLIC_STATS;
      }

      publicStats.structuresCountByRegion =
        await this.adminStructuresService.getStructuresCountByDepartement(
          regionId
        );

      publicStats.structuresCount = structures.length;

      publicStats.usersCount =
        await newUserStructureRepository.countUsersByRegionId({ regionId });
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
