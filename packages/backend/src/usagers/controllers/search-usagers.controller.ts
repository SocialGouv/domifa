import {
  CriteriaSearchField,
  getUsagerDeadlines,
  ETAPE_ENTRETIEN,
  SUPPORT_READ_ROLES,
} from "@domifa/common";
import {
  BadRequestException,
  Body,
  Controller,
  Get,
  ParseBoolPipe,
  Post,
  Query,
  UseGuards,
} from "@nestjs/common";
import { AuthGuard } from "@nestjs/passport";
import { format, parse, subMinutes } from "date-fns";
import { Not } from "typeorm";
import { UserStructureAuthenticated } from "../../_common/model";
import {
  AllowUserProfiles,
  AllowUserStructureRoles,
  CurrentUser,
} from "../../auth/decorators";
import { AppUserGuard } from "../../auth/guards";
import {
  usagerRepository,
  USAGER_LIGHT_ATTRIBUTES,
  joinSelectFields,
} from "../../database";

import { SearchUsagerDto, UpdateManageDto } from "../dto";
import { applyUsagerNameSearch, filterUsagerHistorique } from "../utils";

const RADIES_PREVIEW_LIMIT = 1600;
const RADIES_SEARCH_WITHOUT_CRITERIA_LIMIT = 100;
const UPDATE_MANAGE_DEFAULT_WINDOW_MINUTES = 5;
// Rows committed after the previous poll can carry an older updatedAt (transaction start time)
const UPDATE_MANAGE_OVERLAP_MINUTES = 1;

@Controller("search-usagers")
@UseGuards(AuthGuard("jwt"), AppUserGuard)
@AllowUserProfiles("structure")
@AllowUserStructureRoles(...SUPPORT_READ_ROLES)
export class SearchUsagersController {
  @Get()
  public async findAllByStructure(
    @Query(
      "chargerTousRadies",
      new ParseBoolPipe({
        exceptionFactory: () => new BadRequestException("BAD_REQUEST"),
      })
    )
    chargerTousRadies: boolean,
    @CurrentUser() user: UserStructureAuthenticated
  ) {
    if (typeof chargerTousRadies !== "boolean") {
      throw new BadRequestException("BAD_REQUEST");
    }
    // Taken before reading, so that nothing written during the load is skipped by update-manage
    const syncedAt = new Date();
    const usagersNonRadies = await usagerRepository.find({
      where: {
        statut: Not("RADIE"),
        structureId: user.structureId,
      },
      select: USAGER_LIGHT_ATTRIBUTES,
    });

    const usagersRadiesFirsts = await usagerRepository.find({
      where: {
        statut: "RADIE",
        structureId: user.structureId,
      },
      select: USAGER_LIGHT_ATTRIBUTES,
      // Without an order, the window changes between two calls
      ...(chargerTousRadies
        ? {}
        : { order: { ref: "DESC" }, take: RADIES_PREVIEW_LIMIT }),
    });

    const usagersRadiesTotalCount = chargerTousRadies
      ? usagersRadiesFirsts.length
      : await usagerRepository.count({
          where: {
            statut: "RADIE",
            structureId: user.structureId,
          },
        });

    const usagersMerges = [...usagersNonRadies, ...usagersRadiesFirsts].map(
      filterUsagerHistorique
    );

    return {
      usagersRadiesTotalCount,
      usagers: usagersMerges,
      syncedAt,
    };
  }

  @Get("update-manage")
  public async updateManage(
    @Query() query: UpdateManageDto,
    @CurrentUser() user: UserStructureAuthenticated
  ) {
    const since = query.since
      ? subMinutes(new Date(query.since), UPDATE_MANAGE_OVERLAP_MINUTES)
      : subMinutes(new Date(), UPDATE_MANAGE_DEFAULT_WINDOW_MINUTES);

    const usagers = await usagerRepository
      .createQueryBuilder()
      .select(joinSelectFields([...USAGER_LIGHT_ATTRIBUTES, "updatedAt"]))
      .where(`"structureId" = :structureId AND "updatedAt" >= :since`, {
        structureId: user.structureId,
        since,
      })
      .getRawMany();

    return usagers.map(filterUsagerHistorique);
  }

  @Get("count")
  public async countUsagersByStatus(
    @CurrentUser() user: UserStructureAuthenticated
  ) {
    return usagerRepository.countUsagersByStatus(user.structureId);
  }

  @Post("search-radies")
  public async searchInRadies(
    @Body() search: SearchUsagerDto,
    @CurrentUser() user: UserStructureAuthenticated
  ) {
    const query = usagerRepository
      .createQueryBuilder("usager")
      .select(joinSelectFields(USAGER_LIGHT_ATTRIBUTES))
      .where(`"structureId" = :structureId and statut = 'RADIE'`, {
        structureId: user.structureId,
      });

    if (search.searchString?.length > 0) {
      if (search.searchStringField === CriteriaSearchField.DEFAULT) {
        applyUsagerNameSearch(query, search.searchString);
      } else if (search.searchStringField === CriteriaSearchField.BIRTH_DATE) {
        const formattedDate = format(
          parse(search.searchString, "ddMMyyyy", new Date()),
          "yyyy-MM-dd"
        );
        query.andWhere(`DATE("dateNaissance") = DATE(:date)`, {
          date: formattedDate,
        });
      } else if (
        search.searchStringField === CriteriaSearchField.PHONE_NUMBER
      ) {
        query.andWhere(`telephone->>'numero' ILIKE :phone`, {
          phone: `%${search.searchString}%`,
        });
      }
    }

    if (search?.lastInteractionDate) {
      const deadlines = getUsagerDeadlines();
      const date = deadlines[search.lastInteractionDate].value;

      query.andWhere(
        `("lastInteraction"->>'dateInteraction')::timestamp >= :dateRef::timestamp`,
        {
          dateRef: date,
        }
      );
    }

    if (typeof search?.referrerId !== "undefined") {
      query.andWhere(
        search.referrerId === null
          ? `"referrerId" IS NULL`
          : `"referrerId" = :referrerId`,
        { referrerId: search.referrerId }
      );
    }

    if (search?.entretien) {
      query.andWhere(
        `rdv->>'dateRdv' IS NOT NULL AND "etapeDemande" <= :step AND (rdv->>'dateRdv')::date ${
          search.entretien === "COMING" ? ">" : "<"
        } CURRENT_DATE`,
        { step: ETAPE_ENTRETIEN }
      );
    }

    if (search?.echeance) {
      if (search.echeance === "EXCEEDED") {
        query.andWhere(`(decision->>'dateDecision')::date < CURRENT_DATE`);
      } else if (search.echeance === "NEXT_TWO_WEEKS") {
        query.andWhere(
          `(decision->>'dateDecision')::date BETWEEN CURRENT_DATE AND CURRENT_DATE + 15`
        );
      } else if (search.echeance === "NEXT_TWO_MONTHS") {
        query.andWhere(
          `(decision->>'dateDecision')::date BETWEEN CURRENT_DATE AND CURRENT_DATE + 60`
        );
      } else if (search.echeance.startsWith("PREVIOUS_")) {
        const deadline = getUsagerDeadlines()[search.echeance];
        query.andWhere(`(decision->>'dateDecision')::timestamp < :deadline`, {
          deadline: deadline.value,
        });
      }
    }

    if (
      !search.searchString &&
      !search?.echeance &&
      !search?.entretien &&
      typeof search?.referrerId === "undefined" &&
      !search?.lastInteractionDate
    ) {
      query
        .orderBy(`usager."ref"`, "DESC")
        .take(RADIES_SEARCH_WITHOUT_CRITERIA_LIMIT);
    }

    const usagers = await query.getRawMany();
    return usagers.map(filterUsagerHistorique);
  }
}
