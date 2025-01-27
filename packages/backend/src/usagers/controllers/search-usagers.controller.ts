import {
  Usager,
  UsagerDecision,
  CriteriaSearchField,
  getUsagerDeadlines,
  ETAPE_ENTRETIEN,
} from "@domifa/common";
import {
  Body,
  Controller,
  Get,
  ParseBoolPipe,
  Post,
  Query,
  UseGuards,
} from "@nestjs/common";
import { AuthGuard } from "@nestjs/passport";
import { ApiBearerAuth } from "@nestjs/swagger";
import { format, parse, subMinutes } from "date-fns";
import { Not } from "typeorm";
import {
  USER_STRUCTURE_ROLE_ALL,
  UserStructureAuthenticated,
} from "../../_common/model";
import { AllowUserStructureRoles, CurrentUser } from "../../auth/decorators";
import { AppUserGuard } from "../../auth/guards";
import {
  usagerRepository,
  USAGER_LIGHT_ATTRIBUTES,
  joinSelectFields,
} from "../../database";

import { SearchUsagerDto } from "../dto";

@Controller("search-usagers")
@UseGuards(AuthGuard("jwt"), AppUserGuard)
@ApiBearerAuth()
export class SearchUsagersController {
  @Get()
  @AllowUserStructureRoles(...USER_STRUCTURE_ROLE_ALL)
  public async findAllByStructure(
    @Query("chargerTousRadies", new ParseBoolPipe())
    chargerTousRadies: boolean,
    @CurrentUser() user: UserStructureAuthenticated
  ) {
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
      take: chargerTousRadies ? undefined : 1600,
    });

    const usagersRadiesTotalCount = chargerTousRadies
      ? usagersRadiesFirsts.length
      : await usagerRepository.count({
          where: {
            statut: "RADIE",
            structureId: user.structureId,
          },
        });

    const filterHistorique = (usager: Usager) => {
      if (usager.historique && Array.isArray(usager.historique)) {
        usager.historique = usager.historique.map((item: UsagerDecision) => ({
          statut: item.statut,
          dateDecision: item.dateDecision,
          dateDebut: item.dateDebut,
          dateFin: item.dateFin,
        })) as UsagerDecision[];
      }
      return usager;
    };

    const usagersMerges = [...usagersNonRadies, ...usagersRadiesFirsts].map(
      filterHistorique
    );

    return {
      usagersRadiesTotalCount,
      usagers: usagersMerges,
    };
  }

  @Get("update-manage")
  @AllowUserStructureRoles(...USER_STRUCTURE_ROLE_ALL)
  public async updateManage(@CurrentUser() user: UserStructureAuthenticated) {
    return await usagerRepository
      .createQueryBuilder()
      .select(joinSelectFields(USAGER_LIGHT_ATTRIBUTES))
      .where(
        `"structureId" = :structureId AND "updatedAt" >= :fiveMinutesAgo`,
        {
          structureId: user.structureId,
          fiveMinutesAgo: subMinutes(new Date(), 5),
        }
      )
      .getRawMany();
  }

  @Post("search-radies")
  @AllowUserStructureRoles(...USER_STRUCTURE_ROLE_ALL)
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

    if (search.searchString) {
      if (search.searchStringField === CriteriaSearchField.DEFAULT) {
        query.andWhere("nom_prenom_surnom_ref ILIKE :str", {
          str: `%${search.searchString}%`,
        });
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
      const deadlines = getUsagerDeadlines();
      const now = new Date();
      const deadline = deadlines[search.echeance];

      if (search.echeance === "EXCEEDED") {
        query.andWhere(`(decision->>'dateDecision')::timestamp < :now`, {
          now,
        });
      } else if (search.echeance.startsWith("NEXT_")) {
        query.andWhere(
          `(decision->>'dateDecision')::timestamp <= :deadline AND (decision->>'dateDecision')::timestamp > :now`,
          {
            deadline: deadline.value,
            now,
          }
        );
      } else if (search?.echeance.startsWith("PREVIOUS_")) {
        query.andWhere(`(decision->>'dateDecision')::timestamp < :deadline`, {
          deadline: deadline.value,
          now,
        });
      }
    }

    if (
      !search.searchString &&
      !search?.echeance &&
      !search?.entretien &&
      typeof search?.referrerId !== "undefined" &&
      !search?.lastInteractionDate
    ) {
      query.take(100);
    }

    return await query.getRawMany();
  }
}
