import { Controller, Get, Query, UseGuards } from "@nestjs/common";
import { AuthGuard } from "@nestjs/passport";
import { ApiBearerAuth, ApiTags } from "@nestjs/swagger";
import * as moment from "moment";
import { CurrentUser } from "../../auth/current-user.decorator";
import { StatsGeneratorService } from "../../stats/services/stats-generator.service";
import { AppAuthUser } from "../../_common/model";
import { SearchDto } from "../dto/search.dto";
import { SearchQuery } from "../interfaces/search-query";
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
    @Query() query: SearchDto,
    @CurrentUser() user: AppAuthUser
  ) {
    const searchQuery: SearchQuery = {
      structureId: user.structureId,
    };

    const today = moment().utc().startOf("day").toDate();

    const nextTwoMonths: Date = moment()
      .startOf("day")
      .add(2, "months")
      .toDate();

    const nextTwoWeeks: Date = moment()
      .utc()
      .startOf("day")
      .add(14, "days")
      .toDate();

    const lastTwoMonths: Date = moment()
      .utc()
      .startOf("day")
      .subtract(2, "months")
      .toDate();

    const lastThreeMonths: Date = moment()
      .utc()
      .startOf("day")
      .subtract(3, "months")
      .toDate();

    const echeances: {
      [key: string]: {};
    } = {
      DEPASSEE: { $lte: today },
      DEUX_MOIS: { $lte: nextTwoMonths, $gte: today },
      DEUX_SEMAINES: { $lte: nextTwoWeeks, $gte: today },
    };

    const passages: {
      [key: string]: {};
    } = {
      DEUX_MOIS: { $lte: lastTwoMonths },
      TROIS_MOIS: { $lte: lastThreeMonths },
    };

    /* ID DE LA STRUCTURE DE LUSER */
    if (query.name) {
      const name = query.name
        .replace(/[&\/\\#,+()$~%.\'\":*?<>{}]/gi, "")
        .trim();

      searchQuery.$or = [
        {
          customRef: { $regex: ".*" + name + ".*", $options: "-i" },
        },
        {
          nom: { $regex: ".*" + name + ".*", $options: "-i" },
        },
        {
          prenom: { $regex: ".*" + name + ".*", $options: "-i" },
        },
        {
          surnom: { $regex: ".*" + name + ".*", $options: "-i" },
        },
        {
          ayantsDroits: {
            $elemMatch: {
              nom: { $regex: ".*" + name + ".*", $options: "-i" },
            },
          },
        },
        {
          ayantsDroits: {
            $elemMatch: {
              prenom: { $regex: ".*" + name + ".*", $options: "-i" },
            },
          },
        },
      ];
    }

    if (query.statut && query.statut !== "TOUS") {
      searchQuery["decision.statut"] = query.statut;

      if (query.statut === "RENOUVELLEMENT") {
        searchQuery["decision.statut"] = {
          $in: ["INSTRUCTION", "ATTENTE_DECISION"],
        };
        searchQuery.typeDom = "RENOUVELLEMENT";
      }
    }

    if (query.interactionType && query.interactionType === "courrierIn") {
      searchQuery["lastInteraction.enAttente"] = true;
    }

    if (query.echeance) {
      searchQuery["decision.dateFin"] = echeances[query.echeance];
      searchQuery["decision.statut"] = "VALIDE";
    }

    if (query.passage) {
      searchQuery["decision.statut"] = "VALIDE";
      searchQuery["lastInteraction.dateInteraction"] = passages[query.passage];
    }

    let sort: any = { nom: "ascending", prenom: "ascending" };

    if (query.sortKey && query.sortValue) {
      if (query.sortKey === "RADIE" || query.sortKey === "REFUS") {
        sort = {
          "decision.dateFin": query.sortValue,
          nom: "ascending",
          prenom: "ascending",
        };
      } else if (
        query.sortKey === "INSTRUCTION" ||
        query.sortKey === "ATTENTE_DECISION"
      ) {
        sort = {
          "decision.dateDecision": query.sortValue,
          nom: "ascending",
          prenom: "ascending",
        };
      } else if (query.sortKey === "VALIDE" || query.sortKey === "TOUS") {
        sort = {
          "decision.dateFin": query.sortValue,
          nom: "ascending",
          prenom: "ascending",
        };
      } else if (query.sortKey === "PASSAGE") {
        sort = {
          "lastInteraction.dateInteraction": query.sortValue,
          nom: "ascending",
          prenom: "ascending",
        };
      } else if (query.sortKey === "NAME") {
        sort = { nom: query.sortValue, prenom: "ascending" };
      } else if (query.sortKey === "ID") {
        sort = { customRef: query.sortValue };
      }
    }
    // TODO @toub
    // https://github.com/typeorm/typeorm/issues/5921

    // await this.usagersService.search(searchQuery, sort, query.page)
    // return usagerLightRepository
    //   .findMany(query)
    //   .sort(sort)
    //   .select(
    //     "-createdAt -updatedAt -rdv -structureId -dateNaissance -villeNaissance -import -phone -email -datePremiereDom -docsPath -interactions -preference -historique -entretien -docs"
    //   )
    //   .limit(40)
    //   .collation({
    //     locale: "fr",
    //     numericOrdering: true,
    //     maxVariable: "space",
    //   })
    //   .skip(page && page !== 0 ? 40 * page : 0)
    //   .lean();

    return {
      results: [],
      nbResults: 0, // TODO await usagerLightRepository.count(searchQuery),
    };
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
