import { UsagerOptionsHistoryAction } from "./../../_common/model/usager/options/UsagerOptionsHistoryAction.type";
import {
  Body,
  Controller,
  Delete,
  Get,
  HttpStatus,
  Param,
  ParseArrayPipe,
  ParseIntPipe,
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
import { isEqual } from "lodash";

import sortObj = require("sort-object");

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
    @CurrentUsager() usager: UsagerLight,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    @Param("usagerRef", new ParseIntPipe()) _usagerRef: number
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

    if (usager.options.transfert.actif) {
      usager.options.transfert.dateDebut = new Date(
        usager.options.transfert.dateDebut
      );
      usager.options.transfert.dateFin = new Date(
        usager.options.transfert.dateFin
      );
    }

    if (!isEqual(sortObj(usager.options.transfert), sortObj(transfertDto))) {
      await this.usagerOptionsHistoryService.createOptionHistory(
        usager,
        user,
        action,
        "transfert",
        transfertDto
      );
    }

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
    @CurrentUsager() usager: UsagerLight,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    @Param("usagerRef", new ParseIntPipe()) _usagerRef: number
  ) {
    // Initialisation si vide
    if (typeof usager.options.procurations === "undefined") {
      usager.options.procurations = [];
    }

    // Parcours des procurations
    for (let i = 0; i < 5; i++) {
      let needCreateHistory = true;
      let action: UsagerOptionsHistoryAction = "EDIT";

      if (typeof procurationsDto[i] !== "undefined") {
        // Seulement si la nouvelle procuration est différente de l'ancienne
        if (typeof usager.options.procurations[i] !== "undefined") {
          usager.options.procurations[i].dateDebut = new Date(
            usager.options.procurations[i].dateDebut
          );
          usager.options.procurations[i].dateNaissance = new Date(
            usager.options.procurations[i].dateNaissance
          );
          usager.options.procurations[i].dateFin = new Date(
            usager.options.procurations[i].dateFin
          );

          if (
            isEqual(
              sortObj(usager.options.procurations[i]),
              sortObj(procurationsDto[i])
            )
          ) {
            needCreateHistory = false;
          }
        } else {
          needCreateHistory = true;
          action = "CREATION";
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
    @Param("usagerRef", new ParseIntPipe()) _usagerRef: number,
    @Param("index", new ParseIntPipe()) index: number,
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
