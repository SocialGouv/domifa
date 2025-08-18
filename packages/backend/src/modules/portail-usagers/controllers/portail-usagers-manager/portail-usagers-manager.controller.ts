import {
  Usager,
  UsagersCountByStatus,
  UserUsager,
  UserUsagerWithUsagerInfo,
} from "@domifa/common";
import {
  Body,
  Controller,
  Get,
  HttpStatus,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Res,
  UseGuards,
} from "@nestjs/common";
import {
  USER_STRUCTURE_ROLE_ALL,
  UserStructureAuthenticated,
} from "../../../../_common/model";
import {
  AllowUserProfiles,
  AllowUserStructureRoles,
  CurrentUsager,
  CurrentUser,
} from "../../../../auth/decorators";
import { AppUserGuard, UsagerAccessGuard } from "../../../../auth/guards";
import {
  structureRepository,
  usagerRepository,
  userUsagerRepository,
} from "../../../../database";
import { appLogger, ExpressResponse, getPhoneString } from "../../../../util";
import { Response } from "express";

import { AuthGuard } from "@nestjs/passport";
import { ApiTags, ApiBearerAuth } from "@nestjs/swagger";
import {
  StructureEditPortailUsagerDto,
  UpdatePortailUsagerOptionsDto,
} from "../../dto";
import { AppLogsService } from "../../../app-logs/app-logs.service";
import { userUsagerCreator } from "../../services";
import {
  PageMetaDto,
  PageOptionsDto,
  PageResultsDto,
} from "../../../../usagers/dto";
import { format } from "date-fns";
import * as XLSX from "xlsx";

@Controller("portail-usagers-manager")
@ApiTags("portail-usagers-manager")
@UseGuards(AuthGuard("jwt"), AppUserGuard)
@AllowUserProfiles("structure")
@AllowUserStructureRoles(...USER_STRUCTURE_ROLE_ALL)
@ApiBearerAuth()
export class PortailUsagersManagerController {
  constructor(private readonly appLogsService: AppLogsService) {}

  @AllowUserStructureRoles("admin")
  @Patch("configure-structure")
  public async toggleEnablePortailUsagerByStructure(
    @CurrentUser() user: UserStructureAuthenticated,
    @Body() structurePortailUsagerDto: StructureEditPortailUsagerDto,
    @Res() res: ExpressResponse
  ) {
    const portailUsager = user.structure.portailUsager;

    if (!portailUsager.enabledByDomifa) {
      return res
        .status(HttpStatus.BAD_REQUEST)
        .json({ message: "PORTAIL_NOT_ENABLED_BY_DOMIFA" });
    }

    try {
      await structureRepository.update(
        { id: user.structureId },
        {
          portailUsager: {
            enabledByDomifa: true,
            enabledByStructure: structurePortailUsagerDto.enabledByStructure,
            usagerLoginUpdateLastInteraction:
              structurePortailUsagerDto.usagerLoginUpdateLastInteraction,
          },
        }
      );

      if (
        user.structure.sms.enabledByStructure !==
        structurePortailUsagerDto.enabledByStructure
      ) {
        const action = structurePortailUsagerDto.enabledByStructure
          ? "ENABLE_PORTAIL_BY_STRUCTURE"
          : "DISABLE_PORTAIL_BY_STRUCTURE";

        await this.appLogsService.create({
          userId: user._userId,
          usagerRef: null,
          structureId: user.structureId,
          action,
        });
      }

      const structure = await structureRepository.findOneBy({
        id: user.structureId,
      });
      return res.status(HttpStatus.OK).json(structure);
    } catch (e) {
      appLogger.error("PORTAIL_UPDATE_FAIL", { error: e, sentry: true });
      return res
        .status(HttpStatus.INTERNAL_SERVER_ERROR)
        .json({ message: "PORTAIL_UPDATE_FAIL" });
    }
  }

  @AllowUserStructureRoles(...USER_STRUCTURE_ROLE_ALL)
  @Get("stats")
  public async getUserUsagerStats(
    @CurrentUser() currentUser: UserStructureAuthenticated
  ): Promise<UsagersCountByStatus> {
    return usagerRepository.countUsagersByStatus(currentUser.structureId, true);
  }

  @AllowUserStructureRoles(...USER_STRUCTURE_ROLE_ALL)
  @Get("export/all-accounts")
  public async exportAccountsToExcel(
    @Res() res: Response,
    @CurrentUser() currentUser: UserStructureAuthenticated
  ): Promise<void> {
    const { entities } = await userUsagerRepository.getAccountsWithUsagerInfo(
      currentUser,
      undefined,
      true
    );

    const headers = [
      "Nom",
      "Prénom",
      "Login",
      "Téléphone",
      "Type de mot de passe",
      "Dernière connexion",
      "Dernière modification mot de passe",
      "Compte activé",
      "Dernière mise à jour",
    ];

    const excelRows = entities.map((entity) => [
      entity.nom,
      entity.prenom,
      entity.login,
      getPhoneString(entity.telephone),
      entity.dateNaissance ? new Date(entity.dateNaissance) : "",
      entity.passwordType === "PERSONAL"
        ? "Personnel"
        : entity.passwordType === "BIRTH_DATE"
        ? "Temporaire: date de naissance"
        : "Temporaire: inconnu",
      entity.lastLogin
        ? format(new Date(entity.lastLogin), "dd/MM/yyyy HH:mm")
        : "",
      entity.passwordLastUpdate
        ? format(new Date(entity.passwordLastUpdate), "dd/MM/yyyy HH:mm")
        : "",
      entity.updatedAt
        ? format(new Date(entity.updatedAt), "dd/MM/yyyy HH:mm")
        : "",
    ]);

    const worksheetData = [headers, ...excelRows];

    const workbook = XLSX.utils.book_new();
    const worksheet = XLSX.utils.aoa_to_sheet(worksheetData);

    XLSX.utils.book_append_sheet(workbook, worksheet, "Comptes utilisateurs");

    const excelBuffer = XLSX.write(workbook, {
      type: "buffer",
      bookType: "xlsx",
      compression: true,
    });

    // Configuration des headers de réponse pour le téléchargement
    const fileName = `comptes_utilisateurs_${format(
      new Date(),
      "yyyy-MM-dd_HH-mm-ss"
    )}.xlsx`;

    res.setHeader(
      "Content-Type",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
    );
    res.setHeader("Content-Disposition", `attachment; filename="${fileName}"`);
    res.setHeader("Content-Length", excelBuffer.length);

    res.send(excelBuffer);
  }

  @AllowUserStructureRoles("admin", "responsable")
  @Get("generate-all-accounts")
  public async generateAllAccounts(
    @Res() res: Response,
    @CurrentUser() user: UserStructureAuthenticated
  ) {
    try {
      const usagersWithoutAccounts = await usagerRepository
        .createQueryBuilder("usager")
        .where("usager.structureId = :structureId", {
          structureId: user.structureId,
        })
        .andWhere("usager.options ->> 'portailUsagerEnabled' = 'false'")
        .andWhere("usager.statut = 'VALIDE'")
        .getMany();

      if (usagersWithoutAccounts.length === 0) {
        return res.status(HttpStatus.OK).json({
          message: "Aucun compte à créer",
        });
      }

      for (const usager of usagersWithoutAccounts) {
        try {
          usager.options.portailUsagerEnabled = true;
          await usagerRepository.update(
            { uuid: usager.uuid },
            { options: usager.options }
          );
          await userUsagerCreator.createUserWithTmpPassword(usager, user);
        } catch (error) {
          console.error(error);
          appLogger.warn(
            `Erreur lors de la création du compte pour l'usager ${usager.ref}`,
            {
              error: error.message,
              usagerRef: usager.ref,
              structureId: user.structureId,
            }
          );
        }
      }

      await this.appLogsService.create({
        userId: user.id,
        structureId: user.structureId,
        action: "MON_DOMIFA_CREATE_PORTAIL_ACCOUNT_BULK",
        context: {
          created: usagersWithoutAccounts.length,
        },
      });

      appLogger.info(`Génération de comptes en lot terminée`, {
        structureId: user.structureId,
        userId: user.id,
      });

      return res.status(HttpStatus.CREATED).json({
        message: "Génération des comptes terminée",
      });
    } catch (error) {
      appLogger.error("Erreur lors de la génération de tous les comptes", {
        error,
        sentry: true,
        structureId: user.structureId,
        userId: user.id,
      });

      return res
        .status(HttpStatus.INTERNAL_SERVER_ERROR)
        .json({ message: "ERROR_GENERATING_ALL_ACCOUNTS" });
    }
  }

  @UseGuards(UsagerAccessGuard)
  @AllowUserStructureRoles("simple", "responsable", "admin")
  @Post("enable-access/:usagerRef")
  public async editPreupdatePortailUsagerOptionsference(
    @Res() res: Response,
    @Body() dto: UpdatePortailUsagerOptionsDto,
    @CurrentUsager() usager: Usager,
    @CurrentUser() user: UserStructureAuthenticated
  ) {
    try {
      usager.options.portailUsagerEnabled = dto.portailUsagerEnabled;
      await usagerRepository.update(
        { uuid: usager.uuid },
        {
          options: usager.options,
        }
      );

      if (usager.options.portailUsagerEnabled) {
        const userUsager = await userUsagerRepository.findOneBy({
          usagerUUID: usager.uuid,
        });

        if (!userUsager) {
          const { login, temporaryPassword } =
            await userUsagerCreator.createUserWithTmpPassword(usager, user);
          return res
            .status(HttpStatus.CREATED)
            .json({ usager, login, temporaryPassword });
        } else {
          const generateNewPassword =
            dto.portailUsagerEnabled && dto.generateNewPassword;

          const { userUsager, temporaryPassword } =
            await userUsagerCreator.resetUserUsagerPassword(usager);

          await this.appLogsService.create({
            userId: user.id,
            usagerRef: usager.ref,
            structureId: user.structureId,
            action: "RESET_PASSWORD_PORTAIL",
          });

          return res.status(HttpStatus.CREATED).json({
            usager,
            login: generateNewPassword ? userUsager.login : undefined,
            temporaryPassword,
          });
        }
      }
      return res.status(HttpStatus.OK).json({ usager });
    } catch (error) {
      appLogger.error("Error updating usager options", {
        error,
        sentry: true,
      });
      return res
        .status(HttpStatus.INTERNAL_SERVER_ERROR)
        .json({ message: "ERROR_UPDATING_OPTIONS" });
    }
  }

  @AllowUserStructureRoles(...USER_STRUCTURE_ROLE_ALL)
  @Post("all-accounts")
  public async getAllAccounts(
    @Body() pageOptionsDto: PageOptionsDto,
    @CurrentUser() currentUser: UserStructureAuthenticated
  ): Promise<PageResultsDto<UserUsagerWithUsagerInfo>> {
    const { itemCount, entities } =
      await userUsagerRepository.getAccountsWithUsagerInfo(
        currentUser,
        pageOptionsDto,
        false
      );
    const pageMetaDto = new PageMetaDto({ itemCount, pageOptionsDto });
    return new PageResultsDto(entities, pageMetaDto);
  }

  @UseGuards(UsagerAccessGuard)
  @AllowUserStructureRoles(...USER_STRUCTURE_ROLE_ALL)
  @Get("profile/:usagerRef")
  public async findOne(
    @Param("usagerRef", new ParseIntPipe()) _usagerRef: number,
    @CurrentUsager() currentUsager: Usager
  ): Promise<UserUsager | null> {
    return await userUsagerRepository.findOne({
      where: {
        usagerUUID: currentUsager.uuid,
      },
      select: [
        "updatedAt",
        "login",
        "passwordType",
        "lastLogin",
        "passwordLastUpdate",
      ],
    });
  }
}
