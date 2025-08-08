import { AppLogsService } from "./../../../app-logs/app-logs.service";
import {
  Body,
  Controller,
  Delete,
  HttpStatus,
  Param,
  ParseUUIDPipe,
  Put,
  Res,
  UseGuards,
} from "@nestjs/common";
import { AuthGuard } from "@nestjs/passport";
import { ApiBearerAuth, ApiTags } from "@nestjs/swagger";
import {
  AllowUserProfiles,
  AllowUserSupervisorRoles,
} from "../../../../auth/decorators";
import { AppUserGuard } from "../../../../auth/guards";
import { structureRepository } from "../../../../database";
import { structureDeletorService } from "../../../structures/services/structure-deletor.service";
import { ExpressResponse } from "../../../../util/express";
import { ParseTokenPipe } from "../../../../_common/decorators";
import { StructureConfirmationDto } from "../../dto";
import { FileManagerService } from "../../../../util/file-manager/file-manager.service";
import { join } from "path";
import { domifaConfig } from "../../../../config";
import { cleanPath } from "../../../../util";
import { STRUCTURE_LIGHT_ATTRIBUTES } from "../../constants/STRUCTURE_LIGHT_ATTRIBUTES.const";
import { deleteStructureEmailSender } from "../../../mails/services/templates-renderers";

@UseGuards(AuthGuard("jwt"), AppUserGuard)
@Controller("admin/structures-delete")
@ApiTags("admin")
@ApiBearerAuth()
export class AdminStructuresDeleteController {
  constructor(
    private readonly fileManagerService: FileManagerService,
    private readonly appLogsService: AppLogsService
  ) {}
  @AllowUserProfiles("supervisor")
  @AllowUserSupervisorRoles("super-admin-domifa")
  @ApiBearerAuth()
  @Put("send-mail/:uuid")
  public async deleteSendInitialMail(
    @Res() res: ExpressResponse,
    @Param("uuid", new ParseUUIDPipe()) uuid: string
  ) {
    const structure = await structureDeletorService.generateDeleteToken(uuid);

    if (structure) {
      return deleteStructureEmailSender.sendMail({ structure }).then(
        async () => {
          await this.appLogsService.create({
            action: "ADMIN_STRUCTURE_DELETE",
          });
          return res.status(HttpStatus.OK).json({ message: "OK" });
        },
        () => {
          return res
            .status(HttpStatus.INTERNAL_SERVER_ERROR)
            .json({ message: "MAIL_DELETE_STRUCTURE_ERROR" });
        }
      );
    } else {
      return res
        .status(HttpStatus.INTERNAL_SERVER_ERROR)
        .json({ message: "DELETED_STRUCTURE_NOT_FOUND" });
    }
  }

  @AllowUserProfiles("supervisor")
  @ApiBearerAuth()
  @AllowUserSupervisorRoles("super-admin-domifa")
  @Put("check-token/:uuid/:token")
  public async deleteStructureCheck(
    @Res() res: ExpressResponse,
    @Param("uuid", new ParseUUIDPipe()) uuid: string,
    @Param("token", new ParseTokenPipe()) token: string
  ) {
    try {
      const structure = await structureRepository.findOneOrFail({
        where: {
          token,
          uuid,
        },
        select: STRUCTURE_LIGHT_ATTRIBUTES,
      });

      return res.status(HttpStatus.OK).json(structure);
    } catch (e) {
      return res
        .status(HttpStatus.BAD_REQUEST)
        .json({ message: "CHECK_TOKEN_DELETE_FAIL" });
    }
  }

  @AllowUserProfiles("supervisor")
  @ApiBearerAuth()
  @AllowUserSupervisorRoles("super-admin-domifa")
  @Delete("confirm-delete-structure")
  public async deleteStructureConfirm(
    @Res() res: ExpressResponse,
    @Body() structureConfirmationDto: StructureConfirmationDto
  ) {
    const structure = await structureRepository.findOneBy({
      token: structureConfirmationDto.token,
      uuid: structureConfirmationDto.uuid,
    });

    if (!structure) {
      return res
        .status(HttpStatus.BAD_REQUEST)
        .json({ message: "DELETE_STRUCTURE_FAIL" });
    }

    try {
      const key =
        join(
          domifaConfig().upload.bucketRootDir,
          "usager-documents",
          cleanPath(structure.uuid)
        ) + "/";

      await this.fileManagerService.deleteAllUnderStructure(key);
      await structureDeletorService.deleteStructure(structure);

      return res.status(HttpStatus.OK).json({ message: "OK" });
    } catch (e) {
      return res
        .status(HttpStatus.BAD_REQUEST)
        .json({ message: "DELETE_STRUCTURE_FAIL" });
    }
  }
}
