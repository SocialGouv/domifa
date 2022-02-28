import { Controller, Get, UseGuards } from "@nestjs/common";
import { AuthGuard } from "@nestjs/passport";
import { ApiBearerAuth, ApiTags } from "@nestjs/swagger";

import { CurrentUsager } from "../../auth/decorators/current-usager.decorator";
import { CurrentUser } from "../../auth/decorators/current-user.decorator";
import { UsagerAccessGuard } from "../../auth/guards/usager-access.guard";
import { UsagerLight, UserStructureAuthenticated } from "../../_common/model";
import { usagerOptionsHistoryRepository } from "./../../database/services/usager/usagerOptionsHistoryRepository.service";

@ApiTags("optionsHistory")
@ApiBearerAuth()
@Controller("optionsHistory")
@UseGuards(AuthGuard("jwt"))
export class UsagerOptionsHistoryController {
  @Get(":usagerRef")
  @UseGuards(UsagerAccessGuard)
  public async createNote(
    @CurrentUser() currentUser: UserStructureAuthenticated,
    @CurrentUsager() currentUsager: UsagerLight
  ) {
    // console.log(currentUser);
    // console.log(currentUsager);
    return usagerOptionsHistoryRepository.findMany({
      usagerUUID: currentUsager.uuid,
      structureId: currentUsager.structureId,
    });
  }
}
