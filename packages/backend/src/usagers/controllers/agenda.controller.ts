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
import * as ics from "ics";
import { AllowUserStructureRoles } from "../../auth/decorators";
import { CurrentUsager } from "../../auth/decorators/current-usager.decorator";
import { CurrentUser } from "../../auth/decorators/current-user.decorator";
import { AppUserGuard } from "../../auth/guards";
import { UsagerAccessGuard } from "../../auth/guards/usager-access.guard";
import { domifaConfig } from "../../config";
import {
  MessageEmailIcalEvent,
  usagerLightRepository,
  userStructureRepository,
} from "../../database";
import { usagerAppointmentCreatedEmailSender } from "../../mails/services/templates-renderers";
import { ExpressResponse } from "../../util/express";
import {
  UsagerLight,
  UserStructureAuthenticated,
  UserStructureProfile,
} from "../../_common/model";
import { RdvDto } from "../dto/rdv.dto";
import { UsagersService } from "../services/usagers.service";

@ApiTags("agenda")
@ApiBearerAuth()
@Controller("agenda")
@UseGuards(AuthGuard("jwt"), AppUserGuard)
export class AgendaController {
  constructor(private usagersService: UsagersService) {}

  @Get("users")
  @ApiOperation({ summary: "Liste des utilisateurs pour l'agenda" })
  @AllowUserStructureRoles("simple", "responsable", "admin")
  public getAllUsersForAgenda(
    @CurrentUser() currentUser: UserStructureAuthenticated
  ): Promise<UserStructureProfile[]> {
    return userStructureRepository.findVerifiedStructureUsersByRoles({
      structureId: currentUser.structureId,
      roles: ["admin", "simple", "responsable"],
    });
  }

  @Get("")
  @ApiOperation({ summary: "Liste des rendez-vous à venir" })
  @AllowUserStructureRoles("simple", "responsable", "admin")
  public async getAll(@CurrentUser() user: UserStructureAuthenticated) {
    const userId = user.id;
    return usagerLightRepository.findNextRendezVous({ userId });
  }

  @Post(":usagerRef")
  @UseGuards(UsagerAccessGuard)
  @AllowUserStructureRoles("simple", "responsable", "admin")
  public async postRdv(
    @Body() rdvDto: RdvDto,
    @CurrentUser() currentUser: UserStructureAuthenticated,
    @CurrentUsager() usager: UsagerLight,
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

    const user: UserStructureAuthenticated =
      currentUser.id !== rdvDto.userId
        ? await userStructureRepository.findOne({
            id: rdvDto.userId,
            structureId: currentUser.structureId,
          })
        : currentUser;

    if (!user) {
      return res
        .status(HttpStatus.BAD_REQUEST)
        .json({ message: "USER_AGENDA_NOT_EXIST" });
    }

    const title =
      "Entretien avec " +
      (usager.sexe === "homme" ? "M. " : "Mme. ") +
      usager.nom +
      " " +
      usager.prenom;

    const annee = rdvDto.dateRdv.getFullYear();
    const mois = rdvDto.dateRdv.getMonth() + 1;
    const jour = rdvDto.dateRdv.getDate();
    const heure = rdvDto.dateRdv.getHours();
    const minutes = rdvDto.dateRdv.getMinutes();

    const invitation: ics.ReturnObject = ics.createEvent({
      title,
      description: "Entretien demande de domiciliation",
      start: [annee, mois, jour, heure, minutes],
      organizer: {
        name: currentUser.prenom + " " + currentUser.nom,
        email: currentUser.email,
      },
      startInputType: "local",
      duration: { minutes: 30 },
    });

    const invitationContent = invitation.value;

    if (invitationContent) {
      const icalEvent: MessageEmailIcalEvent = {
        filename: "invitation.ics",
        content: invitationContent,
        method: "publish",
      };
      let message = "";
      if (currentUser.id !== user.id) {
        message =
          "Il vous a été assigné par " +
          currentUser.prenom +
          " " +
          currentUser.nom;
      }

      const updatedUsager = await this.usagersService.setRdv(
        usager,
        rdvDto,
        user
      );

      if (updatedUsager && updatedUsager !== null) {
        if (!domifaConfig().email.emailsEnabled) {
          return res.status(HttpStatus.OK).json(updatedUsager);
        }

        usagerAppointmentCreatedEmailSender
          .sendMail({ user, usager: updatedUsager, icalEvent, message })
          .then(
            () => {
              return res.status(HttpStatus.OK).json(updatedUsager);
            },
            () => {
              return res
                .status(HttpStatus.INTERNAL_SERVER_ERROR)
                .json({ message: "REGISTER_ERROR" });
            }
          );
      } else {
        return res
          .status(HttpStatus.INTERNAL_SERVER_ERROR)
          .json({ message: "CANNOT_SET_RDV" });
      }
    } else {
      return res
        .status(HttpStatus.INTERNAL_SERVER_ERROR)
        .json({ message: "ICS_GENERATION" });
    }
  }
}
