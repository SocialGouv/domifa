import { HomeStats } from "./../../_common/model/stats/HomeStats.type";
import {
  CACHE_MANAGER,
  Controller,
  Get,
  HttpStatus,
  Inject,
  Param,
  Res,
} from "@nestjs/common";
import { ApiTags } from "@nestjs/swagger";
import {
  structureRepository,
  usagerRepository,
  userStructureRepository,
} from "../../database";
import { DEFAULT_PUBLIC_STATS, PublicStats } from "../../_common/model";
import { AdminStructuresService } from "../../_portail-admin/admin-structures/services";
import { StructuresService } from "./../../structures/services/structures.service";
import { Cache } from "cache-manager";
import { ExpressResponse } from "../../util/express";
import { REGIONS_ID_SEO } from "../../util/territoires";

@Controller("stats")
@ApiTags("stats")
export class StatsPublicController {
  constructor(
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
    private readonly adminStructuresService: AdminStructuresService,
    private readonly structuresService: StructuresService
  ) {}

  @Get("home")
  public async home() {
    const homeStats = await this.cacheManager.get("home");
    if (!homeStats) {
      await this.generatePublicStats("stats-nationales");
      return this.cacheManager.get("home");
    }
    return homeStats;
  }

  @Get("public-stats/:regionId?")
  public async getPublicStats(
    @Param("regionId") regionId: string,
    @Res() res: ExpressResponse
  ) {
    if (regionId && typeof REGIONS_ID_SEO[regionId] === "undefined") {
      return res
        .status(HttpStatus.BAD_REQUEST)
        .json({ message: "CANNOT_COMPLETE_DOC" });
    }

    const statsCacheKey = regionId ? "stats-" + regionId : "stats-nationales";
    const statsInCache = await this.cacheManager.get(statsCacheKey);

    // Récupération du cache
    if (statsInCache) {
      return res.status(HttpStatus.OK).json(statsInCache);
    }

    const publicStats = await this.generatePublicStats(statsCacheKey, regionId);

    console.log(publicStats);

    return res.status(HttpStatus.OK).json(publicStats);
  }

  private async getHomeStats(): Promise<HomeStats> {
    return {
      structures: await structureRepository.count(),
      interactions: await this.adminStructuresService.totalInteractions(
        "courrierIn"
      ),
      usagers: await usagerRepository.countTotalUsagers(),
    };
  }

  private async generatePublicStats(
    statsCacheKey: string,
    regionId?: string
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
        await userStructureRepository.countUsersByRegionId({ regionId });
    }
    // Stats nationales
    else {
      publicStats.structuresCount =
        await this.adminStructuresService.countStructures();

      publicStats.structuresCountByRegion =
        await this.adminStructuresService.getStructuresCountByRegion();

      publicStats.usersCount = await userStructureRepository.count();

      // On rafraichit le cache de la homepage
      const homeStats = await this.getHomeStats();

      await this.cacheManager.set("home", homeStats, {
        ttl: 86400,
      });
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

    await this.cacheManager.set(statsCacheKey, publicStats, {
      ttl: 86400,
    });
    return publicStats;
  }
}
