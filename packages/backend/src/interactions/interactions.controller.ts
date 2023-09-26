import { MessageSmsService } from "./../sms/services/message-sms.service";
import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseArrayPipe,
  ParseIntPipe,
  ParseUUIDPipe,
  Post,
  UseGuards,
} from "@nestjs/common";
import { AuthGuard } from "@nestjs/passport";
import { ApiTags } from "@nestjs/swagger";
import {
  AllowUserProfiles,
  CurrentUser,
  CurrentUsager,
  CurrentInteraction,
} from "../auth/decorators";
import {
  AppUserGuard,
  UsagerAccessGuard,
  InteractionsGuard,
} from "../auth/guards";
import { interactionRepository } from "../database";
import {
  UserStructureAuthenticated,
  Interactions,
  Usager,
} from "../_common/model";
import { InteractionDto } from "./dto";
import { InteractionsDeletor, interactionsCreator } from "./services";

@UseGuards(AuthGuard("jwt"), AppUserGuard, UsagerAccessGuard)
@ApiTags("interactions")
@Controller("interactions")
export class InteractionsController {
  constructor(
    private readonly interactionDeletor: InteractionsDeletor,
    private readonly messageSmsService: MessageSmsService
  ) {}

  @Post(":usagerRef")
  @AllowUserProfiles("structure")
  public async postInteractions(
    @Body(new ParseArrayPipe({ items: InteractionDto }))
    interactions: InteractionDto[],
    @CurrentUser() user: UserStructureAuthenticated,
    @CurrentUsager() currentUsager: Usager
  ): Promise<Usager> {
    for (const interaction of interactions) {
      const created = await interactionsCreator.createInteraction({
        interaction,
        usager: currentUsager,
        user,
      });

      await this.messageSmsService.updateSmsAfterCreation({
        interaction: created.interaction,
        structure: user.structure,
        usager: created.usager,
      });

      currentUsager = created.usager;
    }

    return currentUsager;
  }

  @Get(":usagerRef")
  @AllowUserProfiles("structure")
  public async getInteractions(
    @Param("usagerRef", new ParseIntPipe()) _usagerRef: number,
    @CurrentUser() user: UserStructureAuthenticated,
    @CurrentUsager() currentUsager: Usager
  ) {
    return interactionRepository.find({
      where: {
        structureId: user.structureId,
        usagerUUID: currentUsager.uuid,
      },
      order: {
        dateInteraction: "DESC",
      },
      select: [
        "type",
        "dateInteraction",
        "event",
        "content",
        "nbCourrier",
        "previousValue",
        "userName",
        "uuid",
      ],
      skip: 0,
      take: 50,
    });
  }

  @UseGuards(InteractionsGuard)
  @AllowUserProfiles("structure")
  @Delete(":usagerRef/:interactionUuid")
  public async deleteInteraction(
    @CurrentUser() user: UserStructureAuthenticated,
    @CurrentUsager() usager: Usager,
    @Param("interactionUuid", new ParseUUIDPipe()) _interactionUuid: string,
    @Param("usagerRef", new ParseIntPipe()) _usagerRef: number,
    @CurrentInteraction() interaction: Interactions
  ) {
    return this.interactionDeletor.deleteOrRestoreInteraction({
      interaction,
      user,
      usager,
      structure: user.structure,
    });
  }
}
