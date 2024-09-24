import {
  Body,
  Controller,
  Delete,
  Get,
  HttpStatus,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  Res,
  UseGuards,
} from "@nestjs/common";
import { AuthGuard } from "@nestjs/passport";
import { ApiTags, ApiBearerAuth } from "@nestjs/swagger";
import {
  AppUserGuard,
  StructureInformationAccessGuard,
} from "../../../../auth/guards";
import {
  AllowUserStructureRoles,
  CurrentStructureInformation,
  CurrentUser,
} from "../../../../auth/decorators";
import { StructureInformationDto } from "../../dto/structure-information.dto";
import { structureInformationRepository } from "../../../../database";
import { UserStructureAuthenticated } from "../../../../_common/model";
import { ExpressResponse, getCreatedByUserStructure } from "../../../../util";
import { StructureInformation } from "@domifa/common";

@UseGuards(AuthGuard("jwt"), AppUserGuard)
@ApiTags("structure-information")
@AllowUserStructureRoles("admin")
@ApiBearerAuth()
@Controller("structure-information")
export class StructureInformationController {
  @AllowUserStructureRoles("admin")
  @Post()
  public async addInformation(
    @Body() structureInformationDto: StructureInformationDto,
    @CurrentUser() user: UserStructureAuthenticated,
    @Res() res: ExpressResponse
  ) {
    try {
      await structureInformationRepository.save({
        ...structureInformationDto,
        structureId: user.structureId,
        createdBy: getCreatedByUserStructure(user),
      });
      return res.status(HttpStatus.OK).send();
    } catch (e) {
      return res.status(HttpStatus.BAD_REQUEST).json({
        message: "CANNOT_ADD_STRUCTURE_INFORMATION",
      });
    }
  }

  @Get()
  @AllowUserStructureRoles("admin")
  public async getStructureInformation(
    @CurrentUser() user: UserStructureAuthenticated
  ) {
    return structureInformationRepository.findBy({
      structureId: user.structureId,
    });
  }

  @Delete(":uuid")
  @AllowUserStructureRoles("admin")
  @UseGuards(StructureInformationAccessGuard)
  public async deleteInformation(
    @Param("uuid", new ParseUUIDPipe()) _uuid: string,
    @CurrentStructureInformation() structureInformation: StructureInformation,
    @Res() res: ExpressResponse
  ) {
    await structureInformationRepository.delete({
      uuid: structureInformation.uuid,
    });
    return res.status(HttpStatus.OK).json();
  }

  @Patch(":uuid")
  @AllowUserStructureRoles("admin")
  @UseGuards(StructureInformationAccessGuard)
  public async patchInformation(
    @Param("uuid", new ParseUUIDPipe()) _uuid: string,
    @Body() structureInformationDto: StructureInformationDto,
    @CurrentStructureInformation() structureInformation: StructureInformation,
    @CurrentUser() user: UserStructureAuthenticated,
    @Res() res: ExpressResponse
  ) {
    try {
      await structureInformationRepository.update(
        { uuid: structureInformation.uuid },
        {
          ...structureInformationDto,
          createdBy: getCreatedByUserStructure(user),
        }
      );
      return res.status(HttpStatus.OK).json();
    } catch (e) {
      return res.status(HttpStatus.BAD_REQUEST).json({
        message: "CANNOT_ADD_STRUCTURE_INFORMATION",
      });
    }
  }
}
