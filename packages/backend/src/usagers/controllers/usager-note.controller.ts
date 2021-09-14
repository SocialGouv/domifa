import {
  Body,
  Controller,
  HttpStatus,
  Param,
  Post,
  Put,
  Response,
  UseGuards,
} from "@nestjs/common";
import { AuthGuard } from "@nestjs/passport";
import { ApiBearerAuth, ApiTags } from "@nestjs/swagger";
import { CurrentUsager } from "../../auth/current-usager.decorator";
import { CurrentUser } from "../../auth/current-user.decorator";
import { UsagerAccessGuard } from "../../auth/guards/usager-access.guard";
import { usagerRepository } from "../../database";
import { uuidGenerator } from "../../database/services/uuid";
import { ExpressResponse } from "../../util/express";
import {
  UsagerLight,
  UsagerNote,
  UserStructureAuthenticated,
  UserStructureResume,
} from "../../_common/model";
import { CreateNoteDto } from "../dto/create-note.dto";

@ApiTags("note")
@ApiBearerAuth()
@Controller("note")
@UseGuards(AuthGuard("jwt"))
export class UsagerNoteController {
  constructor() {}

  @Post(":usagerRef")
  @UseGuards(UsagerAccessGuard)
  public async createNote(
    @Body() createNoteDto: CreateNoteDto,
    @CurrentUser() currentUser: UserStructureAuthenticated,
    @CurrentUsager() currentUsager: UsagerLight,
    @Response() res: ExpressResponse
  ) {
    const createdBy: UserStructureResume = {
      userId: currentUser.id,
      userName: currentUser.prenom + " " + currentUser.nom,
    };

    const usagerNote: UsagerNote = {
      id: uuidGenerator.random(),
      archived: false,
      createdAt: new Date(),
      createdBy,
      message: createNoteDto.message,
    };

    const usager = await usagerRepository.findOne({
      uuid: currentUsager.uuid,
      structureId: currentUser.structureId,
    });

    const updatedUsager = await usagerRepository.updateOne(
      {
        uuid: currentUsager.uuid,
        structureId: currentUser.structureId,
      },
      {
        notes: usager.notes.concat(usagerNote),
      },
      {}
    );

    return res.status(HttpStatus.OK).json(updatedUsager);
  }
  @Put(":usagerRef/archive/:noteId")
  @UseGuards(UsagerAccessGuard)
  public async archiveNote(
    @Param("noteId") noteId: string,
    @CurrentUser() currentUser: UserStructureAuthenticated,
    @CurrentUsager() currentUsager: UsagerLight,
    @Response() res: ExpressResponse
  ) {
    const usager = await usagerRepository.findOne({
      uuid: currentUsager.uuid,
      structureId: currentUser.structureId,
    });

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
        notes: usager.notes.map((note) => {
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
