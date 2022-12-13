import { usagerNotesRepository } from "../../database/services/usager/usagerNotesRepository.service";
import {
  Body,
  Controller,
  HttpStatus,
  Param,
  ParseIntPipe,
  ParseUUIDPipe,
  Post,
  Put,
  Res,
  UseGuards,
} from "@nestjs/common";
import { AuthGuard } from "@nestjs/passport";
import { ApiBearerAuth, ApiTags } from "@nestjs/swagger";
import { CurrentUsager } from "../../auth/decorators/current-usager.decorator";
import { CurrentUser } from "../../auth/decorators/current-user.decorator";
import { UsagerAccessGuard } from "../../auth/guards/usager-access.guard";

import { ExpressResponse } from "../../util/express";
import {
  UsagerLight,
  UserStructureAuthenticated,
  UserStructureResume,
} from "../../_common/model";
import { CreateNoteDto } from "../dto/create-note.dto";
import { usagerRepository } from "../../database";

@ApiTags("usagers-notes")
@ApiBearerAuth()
@Controller("usagers-notes")
@UseGuards(AuthGuard("jwt"))
export class UsagerNotesController {
  @Post(":usagerRef")
  @UseGuards(UsagerAccessGuard)
  public async createNote(
    @Body() createNoteDto: CreateNoteDto,
    @CurrentUser() currentUser: UserStructureAuthenticated,
    @CurrentUsager() currentUsager: UsagerLight
  ) {
    const createdBy: UserStructureResume = {
      userId: currentUser.id,
      userName: currentUser.prenom + " " + currentUser.nom,
    };

    await usagerNotesRepository.save({
      ...createNoteDto,
      usagerRef: currentUsager.ref,
      usagerUUID: currentUsager.uuid,
      structureId: currentUsager.structureId,
      createdBy,
    });

    return await usagerRepository.findOneOrFail({
      where: {
        uuid: currentUsager.uuid,
      },
      relations: {
        notes: true,
      },
    });
  }

  @Put(":usagerRef/archive/:noteUUID")
  @UseGuards(UsagerAccessGuard)
  public async archiveNote(
    @CurrentUser() currentUser: UserStructureAuthenticated,
    @CurrentUsager() currentUsager: UsagerLight,
    @Param("usagerRef", new ParseIntPipe()) _usagerRef: number,
    @Param("noteUUID", new ParseUUIDPipe()) noteUUID: string,
    @Res() res: ExpressResponse
  ) {
    const note = await usagerNotesRepository.findOneBy({
      uuid: noteUUID,
      usagerUUID: currentUsager.uuid,
    });

    if (!note) {
      return res
        .status(HttpStatus.BAD_REQUEST)
        .json({ message: "USAGER_NOTE_NOT_FOUND" });
    }

    const archivedBy: UserStructureResume = {
      userId: currentUser.id,
      userName: currentUser.prenom + " " + currentUser.nom,
    };

    await usagerNotesRepository.update(
      {
        uuid: note.uuid,
        usagerUUID: currentUsager.uuid,
      },
      {
        archived: true,
        archivedAt: new Date(),
        archivedBy,
      }
    );

    const usager = await usagerRepository.findOneOrFail({
      where: {
        uuid: currentUsager.uuid,
      },
      relations: {
        notes: true,
      },
    });

    return res.status(HttpStatus.OK).json(usager);
  }
}
