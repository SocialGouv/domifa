/* eslint-disable @typescript-eslint/no-unused-vars */
import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseBoolPipe,
  ParseIntPipe,
  ParseUUIDPipe,
  Post,
  Put,
  UseGuards,
} from "@nestjs/common";
import { AuthGuard } from "@nestjs/passport";
import { ApiBearerAuth, ApiTags } from "@nestjs/swagger";
import { CurrentUsager } from "../../auth/decorators/current-usager.decorator";
import { CurrentUser } from "../../auth/decorators/current-user.decorator";
import { UsagerAccessGuard } from "../../auth/guards/usager-access.guard";

import {
  USER_STRUCTURE_ROLE_ALL,
  UserStructureAuthenticated,
} from "../../_common/model";
import {
  UserStructureResume,
  UsagerNote,
  Usager,
  UsagerPinnedNote,
} from "@domifa/common";
import { CreateNoteDto } from "../dto/create-note.dto";
import {
  AppLogTable,
  appLogsRepository,
  usagerNotesRepository,
  usagerRepository,
} from "../../database";
import { CurrentUsagerNote } from "../../auth/decorators/current-usager-note.decorator";
import { AppUserGuard, UsagerNoteAccessGuard } from "../../auth/guards";
import { PageResultsDto, PageMetaDto, PageOptionsDto } from "../dto/pagination";
import { ObjectLiteral } from "typeorm";
import {
  AllowUserProfiles,
  AllowUserStructureRoles,
} from "../../auth/decorators";

@ApiTags("usagers-notes")
@ApiBearerAuth()
@Controller("usagers-notes")
@UseGuards(AuthGuard("jwt"), AppUserGuard)
@AllowUserProfiles("structure")
@AllowUserStructureRoles(...USER_STRUCTURE_ROLE_ALL)
export class UsagerNotesController {
  @Post("search/:usagerRef/:archived")
  @UseGuards(UsagerAccessGuard)
  public async getUsagerNotes(
    @CurrentUser() currentUser: UserStructureAuthenticated,
    @CurrentUsager() currentUsager: Usager,
    @Param("usagerRef", new ParseIntPipe()) _usagerRef: number,
    @Param("archived", new ParseBoolPipe()) archived: boolean,
    @Body() pageOptionsDto: PageOptionsDto
  ) {
    const queryBuilder =
      usagerNotesRepository.createQueryBuilder("usager_notes");

    const whereConditions: ObjectLiteral = {
      structureId: currentUser.structureId,
      usagerRef: currentUsager.ref,
    };

    if (!archived) {
      whereConditions.archived = false;
    }

    queryBuilder
      .where(whereConditions)
      .orderBy("id", pageOptionsDto.order)
      .skip((pageOptionsDto.page - 1) * pageOptionsDto.take)
      .take(pageOptionsDto.take);

    const itemCount = await queryBuilder.getCount();
    const { entities } = await queryBuilder.getRawAndEntities();
    const pageMetaDto = new PageMetaDto({ itemCount, pageOptionsDto });
    return new PageResultsDto(entities, pageMetaDto);
  }

  @UseGuards(UsagerAccessGuard)
  @Post(":usagerRef")
  public async createNote(
    @Body() createNoteDto: CreateNoteDto,
    @CurrentUser() currentUser: UserStructureAuthenticated,
    @CurrentUsager() currentUsager: Usager
  ): Promise<Usager> {
    const createdBy: UserStructureResume = {
      userId: currentUser.id,
      userName: `${currentUser.prenom} ${currentUser.nom}`,
    };

    await usagerNotesRepository.save({
      ...createNoteDto,
      usagerRef: currentUsager.ref,
      usagerUUID: currentUsager.uuid,
      structureId: currentUsager.structureId,
      createdBy,
    });
    return currentUsager;
  }

  @Delete(":usagerRef/:noteUUID")
  @UseGuards(UsagerAccessGuard, UsagerNoteAccessGuard)
  public async deleteNote(
    @CurrentUser() currentUser: UserStructureAuthenticated,
    @CurrentUsagerNote() currentUsagerNote: UsagerNote,
    @CurrentUsager() currentUsager: Usager,
    @Param("usagerRef", new ParseIntPipe()) _usagerRef: number,
    @Param("noteUUID", new ParseUUIDPipe()) _noteUUID: string
  ): Promise<Usager> {
    if (currentUsagerNote.pinned) {
      await usagerRepository.update(
        { uuid: currentUsager.uuid },
        { pinnedNote: null }
      );
      currentUsager.pinnedNote = null;
    }

    await usagerNotesRepository.delete({
      uuid: currentUsagerNote.uuid,
    });

    await appLogsRepository.save(
      new AppLogTable({
        userId: currentUser._userId,
        usagerRef: currentUsager.ref,
        structureId: currentUser.structureId,
        action: "DELETE_NOTE",
      })
    );

    return currentUsager;
  }

  @Put(":usagerRef/pin/:noteUUID")
  @UseGuards(UsagerAccessGuard, UsagerNoteAccessGuard)
  public async pinNote(
    @CurrentUser() _currentUser: UserStructureAuthenticated,
    @CurrentUsagerNote() currentUsagerNote: UsagerNote,
    @CurrentUsager() currentUsager: Usager,
    @Param("usagerRef", new ParseIntPipe()) _usagerRef: number,
    @Param("noteUUID", new ParseUUIDPipe()) _noteUUID: string
  ): Promise<Usager> {
    const newPinnedStatus = !currentUsagerNote.pinned;
    await usagerNotesRepository.update(
      { usagerUUID: currentUsager.uuid },
      { pinned: false }
    );
    await usagerNotesRepository.update(
      { uuid: currentUsagerNote.uuid },
      { pinned: newPinnedStatus }
    );

    const pinnedNote: UsagerPinnedNote = newPinnedStatus
      ? {
          message: currentUsagerNote.message,
          usagerRef: currentUsagerNote.usagerRef,
          createdAt: currentUsagerNote.createdAt,
          createdBy: currentUsagerNote.createdBy,
        }
      : null;

    currentUsager.pinnedNote = pinnedNote;
    await usagerRepository.update({ uuid: currentUsager.uuid }, { pinnedNote });
    return currentUsager;
  }

  @Get("count/:usagerRef")
  @UseGuards(UsagerAccessGuard)
  public async countNotes(
    @CurrentUser() _currentUser: UserStructureAuthenticated,
    @CurrentUsager() currentUsager: Usager,
    @Param("usagerRef", new ParseIntPipe()) _usagerRef: number
  ): Promise<number> {
    return await usagerNotesRepository.countBy({
      usagerUUID: currentUsager.uuid,
      archived: false,
    });
  }

  @Put(":usagerRef/archive/:noteUUID")
  @UseGuards(UsagerAccessGuard, UsagerNoteAccessGuard)
  public async archiveNote(
    @CurrentUser() currentUser: UserStructureAuthenticated,
    @CurrentUsagerNote() currentUsagerNote: UsagerNote,
    @CurrentUsager() currentUsager: Usager,
    @Param("usagerRef", new ParseIntPipe()) _usagerRef: number,
    @Param("noteUUID", new ParseUUIDPipe()) _noteUUID: string
  ): Promise<Usager> {
    if (!currentUsagerNote.archived) {
      await usagerRepository.update(
        { uuid: currentUsager.uuid },
        { pinnedNote: null }
      );
      currentUsager.pinnedNote = null;
    }

    const updateData: Partial<UsagerNote> = !currentUsagerNote.archived
      ? {
          archivedBy: {
            userId: currentUser.id,
            userName: `${currentUser.prenom} ${currentUser.nom}`,
          },
          archived: true,
          archivedAt: new Date(),
          pinned: false,
        }
      : {
          archivedBy: null,
          archived: false,
          archivedAt: null,
        };

    await usagerNotesRepository.update(
      {
        uuid: currentUsagerNote.uuid,
        usagerUUID: currentUsager.uuid,
      },
      updateData
    );

    return currentUsager;
  }
}
