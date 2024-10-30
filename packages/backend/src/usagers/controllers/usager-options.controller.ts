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
import { UserStructureAuthenticated } from "../../_common/model";
import { usagerOptionsHistoryRepository } from "../../database/services/usager/usagerOptionsHistoryRepository.service";
import { AllowUserStructureRoles, CurrentUser } from "../../auth/decorators";
import { TransfertDto, ProcurationDto } from "../dto";
import { UsagerOptionsHistoryService } from "../services";
import { ExpressResponse } from "../../util/express";
import { isEqual } from "lodash";

import sortObj = require("sort-object");
import { usagerRepository } from "../../database";
import {
  Usager,
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
    return await usagerOptionsHistoryRepository.findBy({
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

    await usagerRepository.update(
      { uuid: usager.uuid },
      {
        updatedAt: new Date(),
        options: usager.options,
      }
    );

    return usager;
  }

  @UseGuards(UsagerAccessGuard)
  @AllowUserStructureRoles("simple", "responsable", "admin", "facteur")
  @Post("transfert/:usagerRef")
  public async editTransfert(
    @Body() transfertDto: TransfertDto,
    @CurrentUser() user: UserStructureAuthenticated,
    @CurrentUsager() usager: Usager
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

    await usagerRepository.update(
      { uuid: usager.uuid },
      {
        updatedAt: new Date(),
        options: usager.options,
      }
    );

    return usager;
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

    await usagerRepository.update(
      { uuid: usager.uuid },
      {
        updatedAt: new Date(),
        options: usager.options,
      }
    );

    return usager;
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

    await usagerRepository.update(
      { uuid: usager.uuid },
      {
        updatedAt: new Date(),
        options: usager.options,
      }
    );

    return res.status(HttpStatus.OK).json(usager);
  }
}
