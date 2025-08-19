import { Injectable } from "@nestjs/common";
import { interactionRepository } from "../../../database";
import { PageOptionsDto } from "../../../usagers/dto";
import { In, IsNull, Not } from "typeorm";
import { INTERACTIONS_IN, PageMeta, PageResults } from "@domifa/common";

@Injectable()
export class InteractionsService {
  public async searchInteractions(
    structureId: number,
    usagerUUID: string,
    pageOptionsDto: PageOptionsDto
  ) {
    const queryBuilder = interactionRepository
      .createQueryBuilder("interactions")
      .where({
        structureId,
        usagerUUID,
      })
      .select([
        "type",
        `"dateInteraction"`,
        "content",
        `"nbCourrier"`,
        `"userName"`,
        `"interactionOutUUID"`,
        "uuid",
      ])
      .orderBy(`"dateInteraction"`, pageOptionsDto.order)
      .skip((pageOptionsDto.page - 1) * pageOptionsDto.take)
      .take(pageOptionsDto.take);

    const itemCount = await queryBuilder.getCount();
    const entities = await queryBuilder.getRawMany();

    const pageMetaDto = new PageMeta({
      itemCount,
      pageOptions: pageOptionsDto,
    });
    return new PageResults({ data: entities, meta: pageMetaDto });
  }

  public async searchPendingInteractionsWithContent(
    structureId: number,
    usagerUUID: string
  ) {
    const queryBuilder = interactionRepository
      .createQueryBuilder("interactions")
      .where({
        structureId,
        usagerUUID,
        interactionOutUUID: IsNull(),
        content: Not(IsNull()),
        type: In(INTERACTIONS_IN),
      })
      .select([
        "type",
        `"dateInteraction"`,
        "content",
        `"nbCourrier"`,
        `"userName"`,
      ])
      .orderBy(`"dateInteraction"`, "DESC");

    return queryBuilder.getRawMany();
  }

  public async searchPendingInteractions(
    structureId: number,
    usagerUUID: string
  ) {
    return await interactionRepository
      .createQueryBuilder("interactions")
      .where({
        structureId,
        usagerUUID,
        type: In(["courrierIn", "recommandeIn", "colisIn"]),
        interactionOutUUID: IsNull(),
      })
      .select([
        "type",
        `"dateInteraction"`,
        "content",
        `"nbCourrier"`,
        `"userName"`,
        "uuid",
      ])
      .orderBy(`"dateInteraction"`, "DESC")
      .getRawMany();
  }
}
