import { Controller, Get, UseGuards } from "@nestjs/common";
import { AuthGuard } from "@nestjs/passport";
import { ApiBearerAuth, ApiTags } from "@nestjs/swagger";
import { CurrentUser } from "../../auth/current-user.decorator";
import { usagerLightRepository } from "../../database";
import { StatsGeneratorService } from "../../stats/services/stats-generator.service";
import { AppAuthUser } from "../../_common/model";
import { UsagersService } from "../services/usagers.service";

@UseGuards(AuthGuard("jwt"))
@Controller("search")
@ApiTags("search")
@ApiBearerAuth()
export class SearchController {
  constructor(
    private readonly usagersService: UsagersService,
    private readonly statsService: StatsGeneratorService
  ) {}

  @Get("")
  public async search(
    // @Query() query: SearchDto,
    @CurrentUser() user: AppAuthUser
  ) {
    return usagerLightRepository.findMany(
      {
        structureId: user.structureId,
      },
      {}
    );
  }

  @Get("stats")
  public async stats(@CurrentUser() user: AppAuthUser) {
    const stats: {
      INSTRUCTION: number;
      VALIDE: number;
      ATTENTE_DECISION: number;
      RENOUVELLEMENT: number;
      REFUS: number;
      RADIE: number;
      TOUS: number;
    } = {
      INSTRUCTION: 0,
      VALIDE: 0,
      ATTENTE_DECISION: 0,
      RENOUVELLEMENT: 0,
      REFUS: 0,
      RADIE: 0,
      TOUS: 0,
    };

    stats.VALIDE = await this.nbreUsagersParStatutMaintenant(
      user.structure.id,
      "VALIDE"
    );

    stats.REFUS = await this.nbreUsagersParStatutMaintenant(
      user.structure.id,
      "REFUS"
    );

    stats.RADIE = await this.nbreUsagersParStatutMaintenant(
      user.structure.id,
      "RADIE"
    );

    stats.INSTRUCTION = await this.nbreUsagersParStatutMaintenant(
      user.structure.id,
      "INSTRUCTION"
    );

    stats.ATTENTE_DECISION = await this.nbreUsagersParStatutMaintenant(
      user.structure.id,
      "ATTENTE_DECISION"
    );

    stats.TOUS = await this.nbreUsagersParStatutMaintenant(
      user.structure.id,
      ""
    );

    stats.RENOUVELLEMENT = await this.nbreUsagersParStatutMaintenant(
      user.structure.id,
      "RENOUVELLEMENT"
    );
    // TODO @toub
    return stats;
  }

  private async nbreUsagersParStatutMaintenant(
    structureId: number,
    statut?: string
  ): Promise<number> {
    const query: {
      "decision.statut"?: string | {};
      structureId: number;
    } = {
      "decision.statut": statut,
      structureId,
    };

    if (statut && statut === "RENOUVELLEMENT") {
      query["decision.statut"] = {
        $in: ["INSTRUCTION", "ATTENTE_DECISION"],
      };
    }

    if (statut === "") {
      delete query["decision.statut"];
    }
    // TODO @toub
    return 0;
    // const response = await usagerLightRepository.countDocuments(query);

    // return !response || response === null ? 0 : response;
  }
}
