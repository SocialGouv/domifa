import {
  Body,
  Controller,
  Delete,
  Get,
  HttpStatus,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Res,
  UseGuards,
} from "@nestjs/common";
import { AuthGuard } from "@nestjs/passport";
import { ApiBearerAuth, ApiTags } from "@nestjs/swagger";
import { Response } from "express";

import {
  AllowUserProfiles,
  AllowUserStructureRoles,
} from "../../auth/decorators";
import { CurrentUsager } from "../../auth/decorators/current-usager.decorator";
import { CurrentUser } from "../../auth/decorators/current-user.decorator";
import { AppUserGuard } from "../../auth/guards";
import { UsagerAccessGuard } from "../../auth/guards/usager-access.guard";
import {
  usagerRepository,
  joinSelectFields,
  messageSmsRepository,
  usagerDocsRepository,
  usagerEntretienRepository,
  userStructureRepository,
  USAGER_LIGHT_ATTRIBUTES,
} from "../../database";

import {
  anonymizeFullName,
  appLogger,
  cleanPath,
  getPhoneString,
} from "../../util";
import { UserStructureAuthenticated } from "../../_common/model";
import {
  CheckDuplicateUsagerDto,
  CreateUsagerDto,
  EntretienDto,
  ContactDetailsDto,
} from "../dto";
import { UsagersService } from "../services";
import { AppLogsService } from "../../modules/app-logs/app-logs.service";

import { join } from "path";
import { ExpressResponse } from "../../util/express";
import {
  Usager,
  ETAPE_DOCUMENTS,
  ALL_USER_STRUCTURE_ROLES,
} from "@domifa/common";
import { UsagerHistoryStateService } from "../services/usagerHistoryState.service";
import { domifaConfig } from "../../config";
import { FileManagerService } from "../../util/file-manager/file-manager.service";
import { AssignReferrersDto } from "../dto/assign-referrers.dto";
import { In } from "typeorm";
import { UsagersLogsService } from "../services/usagers-logs.service";
@Controller("usagers")
@ApiTags("usagers")
@UseGuards(AuthGuard("jwt"), AppUserGuard)
@ApiBearerAuth()
@AllowUserStructureRoles("simple", "responsable", "admin")
@AllowUserProfiles("structure")
export class UsagersController {
  constructor(
    private readonly usagersService: UsagersService,
    private readonly appLogsService: AppLogsService,
    private readonly usagerHistoryStateService: UsagerHistoryStateService,
    private readonly fileManagerService: FileManagerService,
    private readonly usagersLogsService: UsagersLogsService
  ) {}

  @Post()
  public async createUsager(
    @Body() usagerDto: CreateUsagerDto,
    @CurrentUser() currentUser: UserStructureAuthenticated,
    @Res() res: ExpressResponse
  ) {
    try {
      // Check referrer
      if (usagerDto?.referrerId) {
        const user = await userStructureRepository.findOneBy({
          id: usagerDto.referrerId,
          structureId: currentUser.structureId,
        });

        if (!user) {
          return res
            .status(HttpStatus.BAD_REQUEST)
            .json({ message: "CANNOT_FIND_REFERRER" });
        }
      }

      const usager = await this.usagersService.create(usagerDto, currentUser);

      return res.status(HttpStatus.OK).json(usager);
    } catch (err) {
      appLogger.error(err);
      return res
        .status(HttpStatus.BAD_REQUEST)
        .json({ message: "CANNOT_CREATE_USAGER" });
    }
  }

  @UseGuards(UsagerAccessGuard)
  @Patch(":usagerRef")
  public async patchUsager(
    @Body() usagerDto: CreateUsagerDto,
    @CurrentUser() _user: UserStructureAuthenticated,
    @CurrentUsager() currentUsager: Usager
  ) {
    if (
      !currentUsager.customRef &&
      (!usagerDto.customRef || usagerDto.customRef === null)
    ) {
      usagerDto.customRef = currentUsager.ref.toString();
    }

    usagerDto.telephone = {
      countryCode: usagerDto.telephone.countryCode,
      numero: getPhoneString(usagerDto.telephone).replace(/\s+/g, ""),
    };

    await usagerRepository.update(
      { uuid: currentUsager.uuid },
      { ...usagerDto }
    );

    await this.usagersLogsService.checkAndLogEmailChanges(
      currentUsager,
      _user,
      currentUsager?.email,
      usagerDto?.email
    );

    await this.usagersLogsService.checkAndLogPhoneChanges(
      currentUsager,
      _user,
      currentUsager?.telephone,
      usagerDto?.telephone
    );

    const createdAt = new Date();
    const historyBeginDate = createdAt;

    await this.usagerHistoryStateService.buildState({
      usager: currentUsager,
      createdAt,
      createdEvent: "update-usager",
      historyBeginDate,
    });

    return { ...currentUsager, ...usagerDto };
  }

  @UseGuards(UsagerAccessGuard)
  @AllowUserStructureRoles(...ALL_USER_STRUCTURE_ROLES)
  @Patch("contact-details/:usagerRef")
  public async patchMailAndPhone(
    @Body() contactDetails: ContactDetailsDto,
    @CurrentUser() _user: UserStructureAuthenticated,
    @CurrentUsager() currentUsager: Usager
  ) {
    const elementsToUpdate: Pick<
      Usager,
      "telephone" | "email" | "contactByPhone"
    > = {
      telephone: {
        countryCode: contactDetails?.telephone?.countryCode ?? "fr",
        numero: getPhoneString(contactDetails.telephone).replace(/\s+/g, ""),
      },
      contactByPhone: contactDetails.contactByPhone,
      email: contactDetails.email,
    };

    await this.usagersLogsService.checkAndLogEmailChanges(
      currentUsager,
      _user,
      currentUsager?.email,
      contactDetails?.email
    );

    await this.usagersLogsService.checkAndLogPhoneChanges(
      currentUsager,
      _user,
      currentUsager?.telephone,
      contactDetails?.telephone
    );

    await usagerRepository.update(
      { uuid: currentUsager.uuid },
      {
        ...elementsToUpdate,
      }
    );

    return {
      ...currentUsager,
      ...elementsToUpdate,
    };
  }

  @UseGuards(UsagerAccessGuard)
  @Post("entretien/:usagerRef")
  public async setEntretien(
    @Body() entretien: EntretienDto,
    @CurrentUser() _user: UserStructureAuthenticated,
    @CurrentUsager() currentUsager: Usager
  ) {
    await usagerEntretienRepository.update(
      { usagerUUID: currentUsager.uuid },
      { ...entretien }
    );

    if (currentUsager.decision.statut === "INSTRUCTION") {
      await usagerRepository.update(
        { uuid: currentUsager.uuid },
        {
          etapeDemande: ETAPE_DOCUMENTS,
        }
      );
    }

    // TODO: optimize this "get". Maybe we can do this better
    const usager = await usagerRepository.getUsager(currentUsager.uuid);
    const createdAt = new Date();
    const historyBeginDate = createdAt;

    await this.usagerHistoryStateService.buildState({
      usager,
      createdAt,
      createdEvent: "update-entretien",
      historyBeginDate,
    });

    return usager;
  }

  @UseGuards(UsagerAccessGuard)
  @Get("next-step/:usagerRef/:etapeDemande")
  public async nextStep(
    @Param("etapeDemande", new ParseIntPipe()) etapeDemande: number,
    @Param("usagerRef", new ParseIntPipe()) _usagerRef: number,
    @CurrentUsager() currentUsager: Usager
  ): Promise<Usager> {
    currentUsager.etapeDemande = etapeDemande;
    await usagerRepository.update(
      { uuid: currentUsager.uuid },
      {
        etapeDemande,
      }
    );
    return currentUsager;
  }

  @UseGuards(UsagerAccessGuard)
  @AllowUserStructureRoles(...ALL_USER_STRUCTURE_ROLES)
  @Get("stop-courrier/:usagerRef")
  public async stopCourrier(
    @CurrentUsager() currentUsager: Usager,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    @Param("usagerRef", new ParseIntPipe()) _usagerRef: number
  ): Promise<Usager> {
    if (currentUsager.options.npai.actif) {
      currentUsager.options.npai.actif = false;
      currentUsager.options.npai.dateDebut = null;
    } else {
      currentUsager.options.npai.actif = true;
      currentUsager.options.npai.dateDebut = new Date();
    }

    await usagerRepository.update(
      { uuid: currentUsager.uuid },
      {
        options: currentUsager.options,
      }
    );
    return currentUsager;
  }

  @Post("check-duplicates-name")
  public async checkDuplicates(
    @Body() duplicateUsagerDto: CheckDuplicateUsagerDto,
    @CurrentUser() user: UserStructureAuthenticated
  ): Promise<Usager[]> {
    return await usagerRepository
      .createQueryBuilder()
      .select(
        joinSelectFields(["nom", "prenom", "ref", "customRef", "dateNaissance"])
      )
      .where(
        `"structureId" = :structureId and LOWER("nom") = :nom and LOWER("prenom") = :prenom`,
        {
          structureId: user.structureId,
          nom: duplicateUsagerDto.nom,
          prenom: duplicateUsagerDto.prenom,
        }
      )
      .getRawMany();
  }

  @UseGuards(UsagerAccessGuard)
  @AllowUserStructureRoles("responsable", "admin")
  @Delete(":usagerRef")
  public async delete(
    @CurrentUser() user: UserStructureAuthenticated,
    @CurrentUsager() usager: Usager,
    @Res() res: ExpressResponse
  ): Promise<ExpressResponse> {
    // Suppression des Documents
    await usagerDocsRepository.delete({
      usagerRef: usager.ref,
      structureId: user.structureId,
    });

    // Suppression des SMS
    await messageSmsRepository.delete({
      usagerRef: usager.ref,
      structureId: user.structureId,
    });

    // Suppression du domicilié
    await usagerRepository.delete({
      ref: usager.ref,
      structureId: user.structureId,
    });

    // Ajout d'un log
    await this.appLogsService.create({
      userId: user.id,
      usagerRef: usager.ref,
      structureId: user.structureId,
      action: "USAGERS_DELETE",
      context: {
        user: anonymizeFullName(user),
        usagerNom: anonymizeFullName(usager),
        usagerRef: usager.ref,
        uuid: usager.uuid,
      },
    });

    const key = `${join(
      domifaConfig().upload.bucketRootDir,
      "usager-documents",
      cleanPath(user.structure.uuid),
      cleanPath(usager.uuid)
    )}/`;

    try {
      await this.fileManagerService.deleteAllUnderStructure(key);
    } catch (e) {
      console.warn(e);
    }
    return res.status(HttpStatus.OK).json({ message: "DELETE_SUCCESS" });
  }

  @UseGuards(UsagerAccessGuard)
  @AllowUserStructureRoles(...ALL_USER_STRUCTURE_ROLES)
  @Get(":usagerRef")
  public findOne(
    @Param("usagerRef", new ParseIntPipe()) _usagerRef: number,
    @CurrentUsager() currentUsager: Usager
  ): Usager {
    return currentUsager;
  }

  @Post("assign-referrers")
  @AllowUserStructureRoles(...ALL_USER_STRUCTURE_ROLES)
  public async assignReferrersToAnotherUser(
    @CurrentUser() userStructureAuth: UserStructureAuthenticated,
    @Body() body: AssignReferrersDto,
    @Res() res: Response
  ) {
    const count = await usagerRepository.count({
      where: {
        structureId: userStructureAuth.structureId,
        ref: In(body.usagersRefs),
      },
    });

    const allRefsValid = count === body.usagersRefs.length;

    if (!allRefsValid) {
      return res
        .status(HttpStatus.BAD_REQUEST)
        .json({ message: "USER_NOT_FOUND" });
    }

    if (body?.newReferrerId) {
      const user = await userStructureRepository.findOneBy({
        id: body.newReferrerId,
        structureId: userStructureAuth.structureId,
      });

      if (!user) {
        return res
          .status(HttpStatus.BAD_REQUEST)
          .json({ message: "USER_NOT_FOUND" });
      }
    }

    await usagerRepository.update(
      {
        structureId: userStructureAuth.structureId,
        ref: In(body.usagersRefs),
      },
      { referrerId: body?.newReferrerId }
    );

    const updatedUsagers = await usagerRepository.find({
      select: USAGER_LIGHT_ATTRIBUTES,
      where: {
        ref: In(body.usagersRefs),
        structureId: userStructureAuth.structureId,
      },
    });

    return res.status(200).json(updatedUsagers);
  }
}
