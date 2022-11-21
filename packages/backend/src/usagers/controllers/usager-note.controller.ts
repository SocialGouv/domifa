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
import { usagerRepository } from "../../database";

import { ExpressResponse } from "../../util/express";
import {
  UsagerLight,
  UsagerNote,
  UserStructureAuthenticated,
  UserStructureResume,
} from "../../_common/model";
import { CreateNoteDto } from "../dto/create-note.dto";
import { v4 as uuidv4 } from "uuid";
@ApiTags("note")
@ApiBearerAuth()
@Controller("note")
@UseGuards(AuthGuard("jwt"))
export class UsagerNoteController {
  @Post(":usagerRef")
  @UseGuards(UsagerAccessGuard)
  public async createNote(
    @Body() createNoteDto: CreateNoteDto,
    @CurrentUser() currentUser: UserStructureAuthenticated,
    @CurrentUsager() currentUsager: UsagerLight,
    @Res() res: ExpressResponse
  ) {
    const createdBy: UserStructureResume = {
      userId: currentUser.id,
      userName: currentUser.prenom + " " + currentUser.nom,
    };

    const usagerNote: UsagerNote = {
      id: uuidv4(),
      archived: false,
      createdAt: new Date(),
      createdBy,
      message: createNoteDto.message,
    };

    const updatedUsager = await usagerRepository.updateOne(
      {
        uuid: currentUsager.uuid,
        structureId: currentUser.structureId,
      },
      {
        notes: currentUsager.notes.concat(usagerNote),
      },
      {}
    );

    return res.status(HttpStatus.OK).json(updatedUsager);
  }
  @Put(":usagerRef/archive/:noteId")
  @UseGuards(UsagerAccessGuard)
  public async archiveNote(
    @CurrentUser() currentUser: UserStructureAuthenticated,
    @CurrentUsager() currentUsager: UsagerLight,
    @Param("usagerRef", new ParseIntPipe()) _usagerRef: number,
    @Param("noteId", new ParseUUIDPipe()) noteId: string,
    @Res() res: ExpressResponse
  ) {
    const archivedBy: UserStructureResume = {
      userId: currentUser.id,
      userName: currentUser.prenom + " " + currentUser.nom,
    };

    const updatedUsager = await usagerRepository.updateOne(
      {
        uuid: currentUsager.uuid,
        structureId: currentUser.structureId,
      },
      {
        notes: currentUsager.notes.map((note) => {
          if (note.id === noteId) {
            return {
              ...note,
              archived: true,
              archivedAt: new Date(),
              archivedBy,
            };
          }
          return note;
        }),
      },
      {}
    );

    return res.status(HttpStatus.OK).json(updatedUsager);
  }
}
