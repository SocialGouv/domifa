import { Controller, Get, Query, UseGuards } from "@nestjs/common";
import { SearchDto } from "../dto/search.dto";
import { CurrentUser } from "../../auth/current-user.decorator";
import { UsagersService } from "../services/usagers.service";
import { User } from "../../users/user.interface";
import { SearchQuery } from "../interfaces/search-query";
import { AuthGuard } from "@nestjs/passport";
import { StatsService } from "../../stats/stats.service";

@UseGuards(AuthGuard("jwt"))
@Controller("search")
export class SearchController {
  constructor(
    private readonly usagersService: UsagersService,
    private readonly statsService: StatsService
  ) {}

  @Get("")
  public async search(@Query() query: SearchDto, @CurrentUser() user: User) {
    let sort: any = { nom: 1 };

    const searchQuery: SearchQuery = {
      structureId: user.structureId,
    };

    const today = new Date();

    const deuxMois: Date = new Date(new Date().setDate(today.getDate() + 60));
    const deuxSemaines: Date = new Date(
      new Date().setDate(today.getDate() + 14)
    );
    const troisMois: Date = new Date(new Date().setDate(today.getDate() + 90));

    const sortValues: {
      [key: string]: {};
    } = {
      az: { nom: "ascending" },
      domiciliation: { "decision.dateDebut": "ascending" },
      radiation: { "decision.dateFin": "descending" },
      za: { nom: "descending" },
    };

    const echeances: {
      [key: string]: {};
    } = {
      DEPASSEE: { $lte: today },
      DEUX_MOIS: { $lte: deuxMois, $gte: today },
      DEUX_SEMAINES: { $lte: deuxSemaines, $gte: today },
    };

    const passages: {
      [key: string]: {};
    } = {
      DEUX_MOIS: { $gte: deuxMois },
      TROIS_MOIS: { $lte: troisMois },
    };

    /* ID DE LA STRUCTURE DE LUSER */
    if (query.name) {
      searchQuery.$or = [
        {
          nom: { $regex: ".*" + query.name + ".*", $options: "-i" },
        },
        {
          prenom: { $regex: ".*" + query.name + ".*", $options: "-i" },
        },
        {
          surnom: { $regex: ".*" + query.name + ".*", $options: "-i" },
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
      searchQuery["lastInteraction.nbCourrier"] = { $gt: 0 };
    }

    if (query.echeance) {
      searchQuery["decision.dateFin"] = echeances[query.echeance];
    }

    if (query.passage) {
      searchQuery["lastInteraction.dateInteraction"] = passages[query.passage];
    }

    if (query.sort) {
      sort = sortValues[query.sort];
    }

    return {
      results: await this.usagersService.search(searchQuery, sort, query.page),
      nbResults: await this.usagersService.count(searchQuery),
    };
  }

  @Get("stats")
  public async stats(@CurrentUser() user: User) {
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

    stats.VALIDE = await this.statsService.totalMaintenant(
      user.structure.id,
      "VALIDE"
    );

    stats.REFUS = await this.statsService.totalMaintenant(
      user.structure.id,
      "REFUS"
    );

    stats.RADIE = await this.statsService.totalMaintenant(
      user.structure.id,
      "RADIE"
    );

    stats.INSTRUCTION = await this.statsService.totalMaintenant(
      user.structure.id,
      "INSTRUCTION"
    );

    stats.ATTENTE_DECISION = await this.statsService.totalMaintenant(
      user.structure.id,
      "ATTENTE_DECISION"
    );

    stats.TOUS = await this.statsService.totalMaintenant(user.structure.id, "");

    stats.RENOUVELLEMENT = await this.statsService.totalMaintenant(
      user.structure.id,
      "RENOUVELLEMENT"
    );

    return stats;
  }
}
