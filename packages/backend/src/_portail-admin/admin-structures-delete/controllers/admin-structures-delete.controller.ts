import {
  Body,
  Controller,
  Delete,
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
import { STRUCTURE_LIGHT_ATTRIBUTES } from "../../../_common/model";
import { ConfirmStructureDeleteDto } from "../../_dto";

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
  }

  @AllowUserProfiles("super-admin-domifa")
  @ApiBearerAuth()
  @Put("check-token/:id/:token")
  public async deleteStructureCheck(
    @Param("id") id: string,
    @Res() res: ExpressResponse,
    @Param("token") token: string
  ) {
    try {
      const structure = await structureLightRepository.findOneOrFail({
        where: {
          token,
          id: parseInt(id, 10),
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

  @AllowUserProfiles("super-admin-domifa")
  @ApiBearerAuth()
  @Delete("confirm-delete-structure")
  public async deleteStructureConfirm(
    @Res() res: ExpressResponse,
    @Body() structureDeleteDto: ConfirmStructureDeleteDto
  ) {
    const structure = await structureLightRepository.findOneBy({
      token: structureDeleteDto.token,
      nom: structureDeleteDto.structureName,
      id: structureDeleteDto.structureId,
    });

    if (!structure) {
      return res
        .status(HttpStatus.BAD_REQUEST)
        .json({ message: "DELETE_STRUCTURE_FAIL" });
    }

    try {
      await structureDeletorService.deleteStructure(structure);
      return res.status(HttpStatus.OK).json({ message: "OK" });
    } catch (e) {
      return res
        .status(HttpStatus.BAD_REQUEST)
        .json({ message: "DELETE_STRUCTURE_FAIL" });
    }
  }
}
