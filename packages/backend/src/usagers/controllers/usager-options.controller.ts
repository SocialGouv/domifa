import {
  Body,
  Controller,
  Delete,
  Get,
  HttpStatus,
  Param,
  ParseArrayPipe,
  Post,
  Res,
  UseGuards,
} from "@nestjs/common";
import { AuthGuard } from "@nestjs/passport";
import { ApiBearerAuth, ApiTags } from "@nestjs/swagger";

import { CurrentUsager } from "../../auth/decorators/current-usager.decorator";

import { UsagerAccessGuard } from "../../auth/guards/usager-access.guard";
import { UsagerLight, UserStructureAuthenticated } from "../../_common/model";
import { usagerOptionsHistoryRepository } from "../../database/services/usager/usagerOptionsHistoryRepository.service";
import { AllowUserStructureRoles, CurrentUser } from "../../auth/decorators";
import { TransfertDto, ProcurationDto } from "../dto";
import { UsagerOptionsHistoryService, UsagersService } from "../services";
import { ExpressResponse } from "../../util/express";

@ApiTags("usagers-options")
@ApiBearerAuth()
@Controller("usagers-options")
@UseGuards(AuthGuard("jwt"))
export class UsagerOptionsController {
  constructor(
    private readonly usagerOptionsHistoryService: UsagerOptionsHistoryService,
    private readonly usagersService: UsagersService
  ) {}

  @UseGuards(UsagerAccessGuard)
  @AllowUserStructureRoles("simple", "responsable", "admin", "facteur")
  @Get("historique/:usagerRef")
  public async createNote(@CurrentUsager() currentUsager: UsagerLight) {
    return usagerOptionsHistoryRepository.findMany({
      usagerUUID: currentUsager.uuid,
      structureId: currentUsager.structureId,
    });
  }

  @UseGuards(UsagerAccessGuard)
  @AllowUserStructureRoles("simple", "responsable", "admin", "facteur")
  @Delete("transfert/:usagerRef")
  public async deleteTransfert(
    @CurrentUser() user: UserStructureAuthenticated,
    @CurrentUsager() usager: UsagerLight
  ) {
    await this.usagerOptionsHistoryService.createOptionHistory(
      usager,
      user,
      "DELETE",
      "transfert",
      usager.options.transfert
    );

    usager.options.transfert = {
      actif: false,
      adresse: null,
      nom: null,
      dateDebut: null,
      dateFin: null,
    };

    return this.usagersService.patch(
      { uuid: usager.uuid },
      { options: usager.options }
    );
  }

  @UseGuards(UsagerAccessGuard)
  @AllowUserStructureRoles("simple", "responsable", "admin", "facteur")
  @Post("transfert/:usagerRef")
  public async editTransfert(
    @Body() transfertDto: TransfertDto,
    @CurrentUser() user: UserStructureAuthenticated,
    @CurrentUsager() usager: UsagerLight
  ) {
    const action = usager.options.transfert.actif ? "EDIT" : "CREATION";

    await this.usagerOptionsHistoryService.createOptionHistory(
      usager,
      user,
      action,
      "transfert",
      transfertDto
    );

    usager.options.transfert = transfertDto;

    return this.usagersService.patch(
      { uuid: usager.uuid },
      { options: usager.options }
    );
  }

  @UseGuards(UsagerAccessGuard)
  @AllowUserStructureRoles("simple", "responsable", "admin", "facteur")
  @Post("procuration/:usagerRef")
  public async editProcuration(
    @Body(new ParseArrayPipe({ items: ProcurationDto }))
    procurationsDto: ProcurationDto[],
    @CurrentUser() user: UserStructureAuthenticated,
    @CurrentUsager() usager: UsagerLight
  ) {
    // Initialisation si vide
    if (typeof usager.options.procurations === "undefined") {
      usager.options.procurations = [];
    }

    const action = usager.options.procurations.length > 0 ? "EDIT" : "CREATION";

    for (let i = 0; i < 2; i++) {
      let needCreateHistory = true;

      // Seulement si la nouvelle procuration est différente de l'ancienne
      if (typeof usager.options.procurations[i] !== undefined) {
        if (
          JSON.stringify(usager.options.procurations[i]) ===
          JSON.stringify(procurationsDto[i])
        ) {
          needCreateHistory = false;
        }
      }

      if (needCreateHistory) {
        await this.usagerOptionsHistoryService.createOptionHistory(
          usager,
          user,
          action,
          "procuration",
          procurationsDto[i]
        );
      }
    }

    usager.options.procurations = procurationsDto;

    return this.usagersService.patch(
      { uuid: usager.uuid },
      { options: usager.options }
    );
  }

  @UseGuards(UsagerAccessGuard)
  @AllowUserStructureRoles("simple", "responsable", "admin", "facteur")
  @Delete("procuration/:usagerRef/:index")
  public async deleteProcuration(
    @Param("index") index: number,
    @CurrentUser() user: UserStructureAuthenticated,
    @CurrentUsager() usager: UsagerLight,
    @Res() res: ExpressResponse
  ) {
    if (typeof usager.options.procurations[index] === "undefined") {
      return res
        .status(HttpStatus.BAD_REQUEST)
        .json({ message: "INDEX_NOT_FOUND" });
    }

    await this.usagerOptionsHistoryService.createOptionHistory(
      usager,
      user,
      "DELETE",
      "procuration",
      usager.options.procurations[index]
    );

    usager.options.procurations.splice(index, 1);

    const updatedUsager = await this.usagersService.patch(
      { uuid: usager.uuid },
      { options: usager.options }
    );

    return res.status(HttpStatus.OK).json(updatedUsager);
  }
}
