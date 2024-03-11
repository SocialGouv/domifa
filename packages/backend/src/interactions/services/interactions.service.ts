import { Injectable } from "@nestjs/common";
import { interactionRepository } from "../../database";
import { PageMetaDto, PageOptionsDto, PageResultsDto } from "../../usagers/dto";
import { In, IsNull } from "typeorm";

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
        "uuid",
      ])
      .orderBy(`"dateInteraction"`, pageOptionsDto.order)
      .skip((pageOptionsDto.page - 1) * pageOptionsDto.take)
      .take(pageOptionsDto.take);

    const itemCount = await queryBuilder.getCount();
    const entities = await queryBuilder.getRawMany();
    const pageMetaDto = new PageMetaDto({ itemCount, pageOptionsDto });
    return new PageResultsDto(entities, pageMetaDto);
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
