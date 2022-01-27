import {
  Controller,
  Delete,
  HttpException,
  HttpStatus,
  Param,
  Put,
  Res,
  UseGuards,
} from "@nestjs/common";
import { AuthGuard } from "@nestjs/passport";
import { ApiBearerAuth, ApiTags } from "@nestjs/swagger";
import { AllowUserProfiles } from "../../../auth/decorators";
import { AppUserGuard } from "../../../auth/guards";
import { structureLightRepository } from "../../../database";
import { deleteStructureEmailSender } from "../../../mails/services/templates-renderers";
import { structureDeletorService } from "../../../structures/services/structureDeletor.service";
import { ExpressResponse } from "../../../util/express";

@UseGuards(AuthGuard("jwt"), AppUserGuard)
@Controller("admin/structures-delete")
@ApiTags("admin")
@ApiBearerAuth()
export class AdminStructuresDeleteController {
  @AllowUserProfiles("super-admin-domifa")
  @ApiBearerAuth()
  @Put("send-mail/:id")
  public async deleteSendInitialMail(
    @Res() res: ExpressResponse,
    @Param("id") id: string
  ) {
    const structure = await structureDeletorService.generateDeleteToken(
      parseInt(id, 10)
    );

    if (!!structure) {
      deleteStructureEmailSender.sendMail({ structure }).then(
        () => {
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
    return true;
  }

  @AllowUserProfiles("super-admin-domifa")
  @ApiBearerAuth()
  @Put("check/:id/:token")
  public async deleteCheck(
    @Param("id") id: string,
    @Param("token") token: string
  ) {
    const structure = await structureLightRepository.findOne({
      token,
      id: parseInt(id, 10),
    });
    if (!structure) {
      throw new HttpException(
        "HARD_RESET_INCORRECT_TOKEN",
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
    return structure;
  }

  @AllowUserProfiles("super-admin-domifa")
  @ApiBearerAuth()
  @Delete("confirm/:id/:token/:nom")
  public async deleteConfirm(
    @Param("id") id: string,
    @Param("token") token: string,
    @Param("nom") nom: string
  ) {
    return structureDeletorService.deleteStructure({
      structureId: parseInt(id, 10),
      token,
      structureNom: nom,
    });
  }
}
