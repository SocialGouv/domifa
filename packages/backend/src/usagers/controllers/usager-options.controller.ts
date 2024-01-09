import {
  Body,
  Controller,
  Delete,
  Get,
  HttpStatus,
  Param,
  ParseArrayPipe,
  ParseEnumPipe,
  ParseIntPipe,
  Post,
  Res,
  UseGuards,
} from "@nestjs/common";
import { AuthGuard } from "@nestjs/passport";
import { ApiBearerAuth, ApiTags } from "@nestjs/swagger";

import { CurrentUsager } from "../../auth/decorators/current-usager.decorator";

import { UsagerAccessGuard } from "../../auth/guards/usager-access.guard";
import { Usager, UserStructureAuthenticated } from "../../_common/model";
import { usagerOptionsHistoryRepository } from "../../database/services/usager/usagerOptionsHistoryRepository.service";
import { AllowUserStructureRoles, CurrentUser } from "../../auth/decorators";
import { TransfertDto, ProcurationDto } from "../dto";
import { UsagerOptionsHistoryService } from "../services";
import { ExpressResponse } from "../../util/express";
import { isEqual } from "lodash";

import sortObj = require("sort-object");
import { usagerRepository } from "../../database";
import {
  UsagerOptionsHistoryAction,
  UsagerOptionsHistoryTypeEnum,
} from "@domifa/common";

@ApiTags("usagers-options")
@ApiBearerAuth()
@Controller("usagers-options")
@UseGuards(AuthGuard("jwt"))
export class UsagerOptionsController {
  constructor(
    private readonly usagerOptionsHistoryService: UsagerOptionsHistoryService
  ) {}

  @UseGuards(UsagerAccessGuard)
  @AllowUserStructureRoles("simple", "responsable", "admin", "facteur")
  @Get("historique/:usagerRef/:type")
  public async createNote(
    @CurrentUsager() currentUsager: Usager,
    @Param("usagerRef", new ParseIntPipe()) _usagerRef: number,
    @Param("type", new ParseEnumPipe(UsagerOptionsHistoryTypeEnum))
    type: UsagerOptionsHistoryTypeEnum
  ) {
    return usagerOptionsHistoryRepository.findBy({
      usagerUUID: currentUsager.uuid,
      type,
      structureId: currentUsager.structureId,
    });
  }

  @UseGuards(UsagerAccessGuard)
  @AllowUserStructureRoles("simple", "responsable", "admin", "facteur")
  @Delete("transfert/:usagerRef")
  public async deleteTransfert(
    @CurrentUser() user: UserStructureAuthenticated,
    @CurrentUsager() usager: Usager,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    @Param("usagerRef", new ParseIntPipe()) _usagerRef: number
  ): Promise<Usager> {
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

    return usagerRepository.updateOneAndReturn(usager.uuid, {
      options: usager.options,
    });
  }

  @UseGuards(UsagerAccessGuard)
  @AllowUserStructureRoles("simple", "responsable", "admin", "facteur")
  @Post("transfert/:usagerRef")
  public async editTransfert(
    @Body() transfertDto: TransfertDto,
    @CurrentUser() user: UserStructureAuthenticated,
    @CurrentUsager() currentUsager: Usager
  ) {
    const action = currentUsager.options.transfert.actif ? "EDIT" : "CREATION";

    if (currentUsager.options.transfert.actif) {
      currentUsager.options.transfert.dateDebut = new Date(
        currentUsager.options.transfert.dateDebut
      );
      currentUsager.options.transfert.dateFin = new Date(
        currentUsager.options.transfert.dateFin
      );
    }

    if (
      !isEqual(sortObj(currentUsager.options.transfert), sortObj(transfertDto))
    ) {
      await this.usagerOptionsHistoryService.createOptionHistory(
        currentUsager,
        user,
        action,
        "transfert",
        transfertDto
      );
    }

    currentUsager.options.transfert = transfertDto;

    return usagerRepository.updateOneAndReturn(currentUsager.uuid, {
      options: currentUsager.options,
    });
  }

  @UseGuards(UsagerAccessGuard)
  @AllowUserStructureRoles("simple", "responsable", "admin", "facteur")
  @Post("procuration/:usagerRef")
  public async editProcuration(
    @Body(new ParseArrayPipe({ items: ProcurationDto }))
    procurationsDto: ProcurationDto[],
    @CurrentUser() user: UserStructureAuthenticated,
    @CurrentUsager() usager: Usager,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    @Param("usagerRef", new ParseIntPipe()) _usagerRef: number
  ): Promise<Usager> {
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

    return usagerRepository.updateOneAndReturn(usager.uuid, {
      options: usager.options,
    });
  }

  @UseGuards(UsagerAccessGuard)
  @AllowUserStructureRoles("simple", "responsable", "admin", "facteur")
  @Delete("procuration/:usagerRef/:index")
  public async deleteProcuration(
    @Param("usagerRef", new ParseIntPipe()) _usagerRef: number,
    @Param("index", new ParseIntPipe()) index: number,
    @CurrentUser() user: UserStructureAuthenticated,
    @CurrentUsager() usager: Usager,
    @Res() res: ExpressResponse
  ): Promise<ExpressResponse> {
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

    const updatedUsager = await usagerRepository.updateOneAndReturn(
      usager.uuid,
      {
        options: usager.options,
      }
    );

    return res.status(HttpStatus.OK).json(updatedUsager);
  }
}
