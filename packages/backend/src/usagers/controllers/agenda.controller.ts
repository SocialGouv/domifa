import {
  Body,
  Controller,
  Get,
  HttpStatus,
  Post,
  Res,
  UseGuards,
} from "@nestjs/common";
import { AuthGuard } from "@nestjs/passport";
import { ApiBearerAuth, ApiOperation, ApiTags } from "@nestjs/swagger";
import { createEvent, ReturnObject } from "ics";

import { AllowUserStructureRoles } from "../../auth/decorators";
import { CurrentUsager } from "../../auth/decorators/current-usager.decorator";
import { CurrentUser } from "../../auth/decorators/current-user.decorator";
import { AppUserGuard } from "../../auth/guards";
import { UsagerAccessGuard } from "../../auth/guards/usager-access.guard";
import { domifaConfig } from "../../config";
import {
  MessageEmailIcalEvent,
  userStructureRepository,
  usagerRepository,
} from "../../database";
import { ExpressResponse } from "../../util/express";
import { UserStructureAuthenticated } from "../../_common/model";
import { RdvDto } from "../dto/decision-form/rdv.dto";
import { UsagersService } from "../services/usagers.service";
import { getPersonFullName, Usager } from "@domifa/common";
import { usagerAppointmentCreatedEmailSender } from "../../modules/mails/services/templates-renderers";

@ApiTags("agenda")
@ApiBearerAuth()
@Controller("agenda")
@UseGuards(AuthGuard("jwt"), AppUserGuard)
export class AgendaController {
  constructor(private readonly usagersService: UsagersService) {}

  @Get("")
  @ApiOperation({ summary: "Liste des rendez-vous à venir" })
  @AllowUserStructureRoles("simple", "responsable", "admin")
  public async getAll(@CurrentUser() user: UserStructureAuthenticated) {
    return await usagerRepository.findNextMeetings({ userId: user.id });
  }

  @Post(":usagerRef")
  @UseGuards(UsagerAccessGuard)
  @AllowUserStructureRoles("simple", "responsable", "admin")
  public async postRdv(
    @Body() rdvDto: RdvDto,
    @CurrentUser() currentUser: UserStructureAuthenticated,
    @CurrentUsager() usager: Usager,
    @Res() res: ExpressResponse
  ) {
    if (rdvDto.isNow) {
      const updatedUsagerNow = await this.usagersService.setRdv(
        usager,
        rdvDto,
        currentUser
      );

      return res.status(HttpStatus.OK).json(updatedUsagerNow);
    }

    const user: Pick<
      UserStructureAuthenticated,
      "id" | "prenom" | "nom" | "email"
    > =
      currentUser.id !== rdvDto.userId
        ? await userStructureRepository.findOne({
            where: {
              id: rdvDto.userId,
              structureId: currentUser.structureId,
            },
            select: ["prenom", "nom", "email", "id"],
          })
        : currentUser;

    if (!user) {
      return res
        .status(HttpStatus.BAD_REQUEST)
        .json({ message: "USER_AGENDA_NOT_EXIST" });
    }

    const title = `Entretien avec ${getPersonFullName(usager)}`;

    const annee = rdvDto.dateRdv.getFullYear();
    const mois = rdvDto.dateRdv.getMonth() + 1;
    const jour = rdvDto.dateRdv.getDate();
    const heure = rdvDto.dateRdv.getHours();
    const minutes = rdvDto.dateRdv.getMinutes();

    const invitation: ReturnObject = createEvent({
      title,
      description: "Entretien demande de domiciliation",
      start: [annee, mois, jour, heure, minutes],
      organizer: {
        name: `${user.prenom} ${user.nom}`,
        email: user.email,
      },
      startInputType: "local",
      duration: { minutes: 30 },
    });

    const invitationContent = invitation.value;

    if (!invitationContent) {
      return res
        .status(HttpStatus.INTERNAL_SERVER_ERROR)
        .json({ message: "ICS_GENERATION" });
    }

    const icalEvent: MessageEmailIcalEvent = {
      filename: "invitation.ics",
      content: invitationContent,
      method: "publish",
    };

    let message = "";
    if (currentUser.id !== user.id) {
      message = `Il vous a été assigné par ${currentUser.prenom} ${currentUser.nom}`;
    }

    const updatedUsager = await this.usagersService.setRdv(
      usager,
      rdvDto,
      user
    );

    if (!updatedUsager) {
      return res
        .status(HttpStatus.INTERNAL_SERVER_ERROR)
        .json({ message: "CANNOT_SET_RDV" });
    }

    if (!domifaConfig().email.emailsEnabled) {
      return res.status(HttpStatus.OK).json(updatedUsager);
    }

    try {
      await usagerAppointmentCreatedEmailSender.sendMail({
        user,
        usager: updatedUsager,
        icalEvent,
        message,
      });
      return res.status(HttpStatus.OK).json(updatedUsager);
    } catch (e) {
      return res
        .status(HttpStatus.INTERNAL_SERVER_ERROR)
        .json({ message: "REGISTER_ERROR" });
    }
  }
}
