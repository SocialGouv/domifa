import {
  Body,
  Controller,
  Get,
  HttpStatus,
  Post,
  Res,
  UseGuards,
  InternalServerErrorException,
} from "@nestjs/common";
import { AuthGuard } from "@nestjs/passport";
import { ApiBearerAuth, ApiOperation, ApiTags } from "@nestjs/swagger";

import {
  AllowUserProfiles,
  AllowUserStructureRoles,
} from "../../auth/decorators";
import { CurrentUsager } from "../../auth/decorators/current-usager.decorator";
import { CurrentUser } from "../../auth/decorators/current-user.decorator";
import { AppUserGuard } from "../../auth/guards";
import { UsagerAccessGuard } from "../../auth/guards/usager-access.guard";
import { domifaConfig } from "../../config";
import { userStructureRepository, usagerRepository } from "../../database";
import { ExpressResponse } from "../../util/express";
import { UserStructureAuthenticated } from "../../_common/model";
import { RdvDto } from "../dto/decision-form/rdv.dto";
import { UsagersService } from "../services/usagers.service";
import { Usager } from "@domifa/common";
import { AppointmentInvitationService } from "../services/appointment-invitation.service";

@ApiTags("agenda")
@ApiBearerAuth()
@Controller("agenda")
@UseGuards(AuthGuard("jwt"), AppUserGuard)
@AllowUserProfiles("structure")
@AllowUserStructureRoles("simple", "responsable", "admin")
export class AgendaController {
  constructor(
    private readonly usagersService: UsagersService,
    private readonly appointmentInvitationService: AppointmentInvitationService
  ) {}

  @Get("")
  @ApiOperation({ summary: "Liste des rendez-vous à venir" })
  public async getAll(@CurrentUser() user: UserStructureAuthenticated) {
    return await usagerRepository.findNextMeetings({ userId: user.id });
  }

  @Post(":usagerRef")
  @UseGuards(UsagerAccessGuard)
  public async postRdv(
    @Body() rdvDto: RdvDto,
    @CurrentUser() currentUser: UserStructureAuthenticated,
    @CurrentUsager() usager: Usager,
    @Res() res: ExpressResponse
  ) {
    if (rdvDto.isNow) {
      const updatedUsager = await this.usagersService.setRdv(
        usager,
        rdvDto,
        currentUser
      );
      return res.status(HttpStatus.OK).json(updatedUsager);
    }

    if (currentUser.id === rdvDto.userId) {
      return res.status(HttpStatus.OK).json({
        id: currentUser.id,
        prenom: currentUser.prenom,
        nom: currentUser.nom,
        email: currentUser.email,
        structure: currentUser.structure,
      });
    }

    const user = await userStructureRepository.findOneBy({
      id: rdvDto.userId,
      structureId: currentUser.structureId,
    });

    if (!user) {
      return res
        .status(HttpStatus.BAD_REQUEST)
        .json({ message: "USER_AGENDA_FAIL" });
    }

    const assignedUser = { ...user, structure: currentUser.structure };

    const updatedUsager = await this.usagersService.setRdv(
      usager,
      rdvDto,
      assignedUser
    );

    if (!updatedUsager) {
      return res
        .status(HttpStatus.BAD_REQUEST)
        .json({ message: "CANNOT_SET_RDV" });
    }

    if (domifaConfig().email.emailsEnabled) {
      await this.sendAppointmentInvitation(
        assignedUser,
        updatedUsager,
        rdvDto.dateRdv,
        currentUser
      );
    }

    return res.status(HttpStatus.OK).json(updatedUsager);
  }

  private async sendAppointmentInvitation(
    assignedUser: Pick<
      UserStructureAuthenticated,
      "id" | "prenom" | "nom" | "email" | "structure"
    >,
    usager: Usager,
    dateRdv: Date,
    currentUser: UserStructureAuthenticated
  ): Promise<void> {
    try {
      await this.appointmentInvitationService.sendAppointmentInvitation({
        user: assignedUser,
        usager,
        dateRdv,
        assignedByUser:
          currentUser.id !== assignedUser.id ? currentUser : undefined,
      });
    } catch (error) {
      throw new InternalServerErrorException("EMAIL_SEND_ERROR");
    }
  }
}
