import {
  Usager,
  UsagerDecision,
  CriteriaSearchField,
  getUsagerDeadlines,
  ETAPE_ENTRETIEN,
  ALL_USER_STRUCTURE_ROLES,
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
import { ApiBearerAuth } from "@nestjs/swagger";
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

import { SearchUsagerDto } from "../dto";

// Chaque usager embarque des colonnes JSONB non bornées (historique des
// décisions, ayants droit) : hydrater puis sérialiser une structure entière se
// compte en secondes de thread principal. Node n'exécutant le JS que sur un
// thread, quelques requêtes de ce coût suffisent à ce que la file d'attente ne
// se vide plus — le pod cesse alors de répondre à tout, /healthz compris.
// Ces bornes plafonnent le coût d'une requête.
export const MAX_USAGERS_RADIES_LOADED = 10000;
export const MAX_USAGERS_RADIES_PREVIEW = 1600;
export const MAX_USAGERS_RADIES_SEARCH_RESULTS = 1000;
export const MAX_USAGERS_RADIES_SEARCH_RESULTS_WITHOUT_CRITERIA = 100;
export const MAX_USAGERS_UPDATE_MANAGE = 2000;

// Une limite sans ordre n'est pas une limite : Postgres rend les lignes dans
// l'ordre du tas, qu'un simple UPDATE déplace. La fenêtre changerait donc
// toute seule d'un appel à l'autre, faisant disparaître des dossiers sans que
// rien ne l'indique. On trie sur `ref`, couvert par l'index unique
// (structureId, ref), du plus récent au plus ancien.
const USAGER_BOUNDED_ORDER = { ref: "DESC" } as const;

// L'interface n'affiche que ces quatre champs par décision. Les colonnes
// `historique` cumulent en revanche chaque décision jamais prise, texte libre
// compris : les rogner avant de sérialiser évite d'envoyer des dizaines de Mo.
const filterHistorique = <T extends Pick<Usager, "historique">>(
  usager: T
): T => {
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

@Controller("search-usagers")
@UseGuards(AuthGuard("jwt"), AppUserGuard)
@AllowUserProfiles("structure")
@AllowUserStructureRoles(...ALL_USER_STRUCTURE_ROLES)
@ApiBearerAuth()
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
    const usagersNonRadies = await usagerRepository.find({
      where: {
        statut: Not("RADIE"),
        structureId: user.structureId,
      },
      select: USAGER_LIGHT_ATTRIBUTES,
      order: USAGER_BOUNDED_ORDER,
    });

    const usagersRadiesFirsts = await usagerRepository.find({
      where: {
        statut: "RADIE",
        structureId: user.structureId,
      },
      select: USAGER_LIGHT_ATTRIBUTES,
      order: USAGER_BOUNDED_ORDER,
      take: chargerTousRadies
        ? MAX_USAGERS_RADIES_LOADED
        : MAX_USAGERS_RADIES_PREVIEW,
    });

    // Toujours compté en base : le nombre de radiés chargés est plafonné, il ne
    // reflète donc pas le total que l'interface doit afficher.
    const usagersRadiesTotalCount = await usagerRepository.count({
      where: {
        statut: "RADIE",
        structureId: user.structureId,
      },
    });

    const usagersMerges = [...usagersNonRadies, ...usagersRadiesFirsts].map(
      filterHistorique
    );

    return {
      usagersRadiesTotalCount,
      usagers: usagersMerges,
    };
  }

  @Get("update-manage")
  public async updateManage(@CurrentUser() user: UserStructureAuthenticated) {
    // Rafraîchissement automatique, déclenché toutes les 5 minutes par chaque
    // onglet ouvert. Une réaffectation de masse (changement de rôle, suppression
    // d'un utilisateur, import) touche l'`updatedAt` de tous les dossiers d'un
    // coup et faisait alors remonter la structure entière, historique compris.
    const usagers = await usagerRepository
      .createQueryBuilder()
      .select(joinSelectFields(USAGER_LIGHT_ATTRIBUTES))
      .where(
        `"structureId" = :structureId AND "updatedAt" >= :fiveMinutesAgo`,
        {
          structureId: user.structureId,
          fiveMinutesAgo: subMinutes(new Date(), 5),
        }
      )
      .orderBy(`"updatedAt"`, "DESC")
      .limit(MAX_USAGERS_UPDATE_MANAGE)
      .getRawMany();

    return usagers.map(filterHistorique);
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

    const hasNoCriteria =
      !search.searchString &&
      !search?.echeance &&
      !search?.entretien &&
      typeof search?.referrerId === "undefined" &&
      !search?.lastInteractionDate;

    query
      .orderBy(`usager."ref"`, "DESC")
      .take(
        hasNoCriteria
          ? MAX_USAGERS_RADIES_SEARCH_RESULTS_WITHOUT_CRITERIA
          : MAX_USAGERS_RADIES_SEARCH_RESULTS
      );

    return await query.getRawMany();
  }
}
