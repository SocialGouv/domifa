import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Post,
  Res,
  UseGuards,
} from "@nestjs/common";
import { AuthGuard } from "@nestjs/passport";
import { ApiTags } from "@nestjs/swagger";
import { AllowUserProfiles, CurrentUser } from "../../auth/decorators";
import { AppUserGuard } from "../../auth/guards";
import { ExpressResponse } from "../../util/express";
import { UserUsagerAuthenticated } from "../../_common/model";
import { usagerRepository } from "../../database";
import { InteractionsService } from "../../interactions/services";
import { PageOptionsDto } from "../../usagers/dto";

@Controller("portail-usagers/profile")
@UseGuards(AuthGuard("jwt"), AppUserGuard)
@ApiTags("profile")
export class PortailUsagersProfileController {
  constructor(private readonly interactionsService: InteractionsService) {}

  @Get("me")
  @AllowUserProfiles("usager")
  @HttpCode(HttpStatus.OK)
  public async meUsager(
    @Res() res: ExpressResponse,
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
    @Res() res: ExpressResponse,
    @CurrentUser() currentUser: UserUsagerAuthenticated,
    @Body() pageOptionsDto: PageOptionsDto
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

  @Get("pending-interactions")
  @AllowUserProfiles("usager")
  @HttpCode(HttpStatus.OK)
  public async getPendingInteractions(
    @Res() res: ExpressResponse,
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
}
