import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseUUIDPipe,
  Post,
  Res,
  UseGuards,
} from "@nestjs/common";
import { AuthGuard } from "@nestjs/passport";
import { ApiBearerAuth, ApiTags } from "@nestjs/swagger";
import { AllowUserProfiles, CurrentUser } from "../../../../auth/decorators";
import { AppUserGuard } from "../../../../auth/guards";
import { UserUsagerAuthenticated } from "../../../../_common/model";
import {
  structureInformationRepository,
  USAGER_DOCS_FIELDS_TO_SELECT,
  usagerDocsRepository,
  usagerRepository,
} from "../../../../database";
import { InteractionsService } from "../../../interactions/services";
import { PageOptionsDto } from "../../../../usagers/dto";
import { appLogger } from "../../../../util";
import { FileManagerService } from "../../../../util/file-manager/file-manager.service";
import { AppLogsService } from "../../../app-logs/app-logs.service";
import { Response } from "express";

@Controller("portail-usagers/profile")
@UseGuards(AuthGuard("jwt"), AppUserGuard)
@ApiBearerAuth()
@ApiTags("profile")
export class PortailUsagersProfileController {
  constructor(
    private readonly interactionsService: InteractionsService,
    private readonly fileManagerService: FileManagerService,
    private readonly appLogsService: AppLogsService
  ) {}

  @Get("me")
  @AllowUserProfiles("usager")
  @HttpCode(HttpStatus.OK)
  public async meUsager(
    @Res() res: Response,
    @CurrentUser() currentUser: UserUsagerAuthenticated
  ) {
    const usager = await usagerRepository.getUserUsagerData({
      usagerUUID: currentUser.usager.uuid,
    });

    return res.status(HttpStatus.OK).json({
      usager,
      acceptTerms: currentUser.user.acceptTerms,
    });
  }

  @Post("interactions")
  @AllowUserProfiles("usager")
  @HttpCode(HttpStatus.OK)
  public async getInteractions(
    @CurrentUser() currentUser: UserUsagerAuthenticated,
    @Body() pageOptionsDto: PageOptionsDto,
    @Res() res: Response
  ) {
    const usager = await usagerRepository.getUserUsagerData({
      usagerUUID: currentUser.usager.uuid,
    });

    try {
      const interactions = await this.interactionsService.searchInteractions(
        usager.structureId,
        usager.uuid,
        pageOptionsDto
      );

      return res.status(HttpStatus.OK).json(interactions);
    } catch (e) {
      return res.status(HttpStatus.BAD_REQUEST).json({
        message: "CANNOT_GET_INTERACTIONS",
        pageOptionsDto,
      });
    }
  }

  @Get("structure-information")
  @AllowUserProfiles("usager")
  @HttpCode(HttpStatus.OK)
  public async getStructureInformation(
    @CurrentUser() currentUser: UserUsagerAuthenticated
  ) {
    return await structureInformationRepository.findBy({
      structureId: currentUser.structure.id,
    });
  }

  @Get("pending-interactions")
  @AllowUserProfiles("usager")
  @HttpCode(HttpStatus.OK)
  public async getPendingInteractions(
    @Res() res: Response,
    @CurrentUser() currentUser: UserUsagerAuthenticated
  ) {
    try {
      const interactions =
        await this.interactionsService.searchPendingInteractions(
          currentUser.usager.structureId,
          currentUser.usager.uuid
        );

      return res.status(HttpStatus.OK).json(interactions);
    } catch (e) {
      return res.status(HttpStatus.BAD_REQUEST).json({
        message: "CANNOT_GET_PENDING_INTERACTIONS",
      });
    }
  }

  @Get("download-document/:docUuid")
  @AllowUserProfiles("usager")
  @HttpCode(HttpStatus.OK)
  public async getDocument(
    @Param("docUuid", new ParseUUIDPipe()) docUuid: string,
    @CurrentUser() currentUser: UserUsagerAuthenticated,
    @Res() res: Response
  ) {
    const doc = await usagerDocsRepository.findOneBy({
      uuid: docUuid,
      shared: true,
      structureId: currentUser.structure.id,
    });

    if (
      !doc ||
      !currentUser?.structure ||
      !doc?.encryptionContext ||
      doc?.encryptionVersion !== 0
    ) {
      await this.appLogsService.create({
        userId: currentUser.user.id,
        usagerRef: currentUser.usager.ref,
        structureId: currentUser.structure.id,
        action: "MON_DOMIFA_DOWNLOAD_DOC_TRY",
      });

      appLogger.error("CANNOT_DOWNLOAD_DOC_PORTAIL", { sentry: true });
      return res
        .status(HttpStatus.INTERNAL_SERVER_ERROR)
        .json({ message: "CANNOT_DOWNLOAD_DOC_PORTAIL" });
    }

    await this.appLogsService.create({
      userId: currentUser.user.id,
      usagerRef: currentUser.usager.ref,
      structureId: currentUser.structure.id,
      action: "MON_DOMIFA_DOWNLOAD_DOC",
    });

    try {
      return await this.fileManagerService.dowloadEncryptedFile(
        res,
        currentUser.structure.uuid,
        currentUser.usager.uuid,
        doc
      );
    } catch (e) {
      console.log(e);
      return res
        .status(HttpStatus.INTERNAL_SERVER_ERROR)
        .json({ message: "CANNOT_DOWNLOAD_DOC_PORTAIL" });
    }
  }

  @AllowUserProfiles("usager")
  @HttpCode(HttpStatus.OK)
  @Get("documents")
  public async getDocuments(
    @CurrentUser() currentUser: UserUsagerAuthenticated
  ) {
    return await usagerDocsRepository.find({
      where: {
        shared: true,
        usagerUUID: currentUser.usager.uuid,
        structureId: currentUser.structure.id,
      },
      select: { ...USAGER_DOCS_FIELDS_TO_SELECT },
    });
  }
}
