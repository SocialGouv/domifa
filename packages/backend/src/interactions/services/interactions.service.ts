import { Injectable } from "@nestjs/common";
import { FindConditions, LessThan, MoreThan } from "typeorm";
import { interactionRepository, InteractionsTable } from "../../database";
import { UserStructure } from "../../_common/model";
import { Interactions, InteractionType } from "../../_common/model/interaction";

@Injectable()
export class InteractionsService {
  constructor() {}

  public async findOne(
    usagerRef: number,
    interactionUuid: string,
    user: Pick<UserStructure, "structureId">
  ): Promise<Interactions | null> {
    return interactionRepository.findOne({
      uuid: interactionUuid,
      structureId: user.structureId,
      usagerRef,
    });
  }

  public async findLastInteraction(
    usagerRef: number,
    dateInteraction: Date,
    typeInteraction: InteractionType,
    user: Pick<UserStructure, "structureId">,
    isIn: string
  ): Promise<Interactions | null> {
    const dateQuery =
      isIn === "out" ? LessThan(dateInteraction) : MoreThan(dateInteraction);

    const where: FindConditions<InteractionsTable> = {
      structureId: user.structureId,
      usagerRef,
      type: typeInteraction,
      dateInteraction: dateQuery,
    };
    return interactionRepository.findOne(where as any);
  }

  public async totalInteractionAllUsagersStructure({
    structureId,
  }: {
    structureId: number;
  }): Promise<
    {
      usagerRef: number;
      appel: number;
      visite: number;
      courrierIn: number;
      courrierOut: number;
      recommandeIn: number;
      recommandeOut: number;
      colisIn: number;
      colisOut: number;
    }[]
  > {
    // NOTE: cette requête ne renvoit pas de résultats pour les usagers de cette structure qui n'ont pas d'interaction
    const query = `SELECT
        i."usagerRef",
        coalesce (COUNT(CASE WHEN i.type = 'appel' THEN 1 END), 0) AS "appel",
        coalesce (COUNT(CASE WHEN i.type = 'visite' THEN 1 END), 0) AS "visite",
        coalesce (SUM(CASE WHEN i.type = 'courrierIn' THEN "nbCourrier" END), 0) AS "courrierIn",
        coalesce (SUM(CASE WHEN i.type = 'courrierOut' THEN "nbCourrier" END), 0) AS "courrierOut",
        coalesce (SUM(CASE WHEN i.type = 'recommandeIn' THEN "nbCourrier" END), 0) AS "recommandeIn",
        coalesce (SUM(CASE WHEN i.type = 'recommandeOut' THEN "nbCourrier" END), 0) AS "recommandeOut",
        coalesce (SUM(CASE WHEN i.type = 'colisIn' THEN "nbCourrier" END), 0) AS "colisIn",
        coalesce (SUM(CASE WHEN i.type = 'colisOut' THEN "nbCourrier" END), 0) AS "colisOut"
      FROM interactions i
      WHERE i."structureId" = $1 and i.event = 'create'
      GROUP BY i."usagerRef"`;
    const results = await (
      await interactionRepository.typeorm()
    ).query(query, [structureId]);
    return results.map((x) => ({
      usagerRef: x.usagerRef,
      courrierIn: parseInt(x.courrierIn, 10),
      courrierOut: parseInt(x.courrierOut, 10),
      recommandeIn: parseInt(x.recommandeIn, 10),
      recommandeOut: parseInt(x.recommandeOut, 10),
      colisIn: parseInt(x.colisIn, 10),
      colisOut: parseInt(x.colisOut, 10),
      appel: parseInt(x.appel, 10),
      visite: parseInt(x.visite, 10),
    }));
  }

  public async totalInteraction(
    structureId: number,
    usagerRef: number,
    interactionType: InteractionType
  ): Promise<number> {
    if (interactionType === "appel" || interactionType === "visite") {
      return interactionRepository.count({
        where: {
          structureId,
          usagerRef,
          type: interactionType,
          event: "create",
        },
      });
    } else {
      const search = await (
        await interactionRepository.typeorm()
      )
        .createQueryBuilder("interactions")
        .select("SUM(interactions.nbCourrier)", "sum")
        .where({
          structureId,
          usagerRef,
          type: interactionType,
          event: "create",
        })
        .groupBy("interactions.type")
        .getRawOne();
      return typeof search !== "undefined" ? search.sum : 0;
    }
  }
}
