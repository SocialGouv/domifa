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
