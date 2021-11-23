import {
  Body,
  Controller,
  Get,
  HttpException,
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
    const user = await userStructureRepository.findOne({
      id: rdvDto.userId,
      structureId: currentUser.structureId,
    });

    if (!user) {
      throw new HttpException("USER_AGENDA_NOT_EXIST", HttpStatus.BAD_REQUEST);
    }

    const title =
      "Entretien avec " +
      (usager.sexe === "homme" ? "M. " : "Mme. ") +
      usager.nom +
      " " +
      usager.prenom;

    const dateRdv = new Date(rdvDto.dateRdv);

    if (rdvDto.isNow) {
      const updatedUsager = await this.usagersService.setRdv(
        { uuid: usager.uuid },
        rdvDto,
        currentUser
      );

      return res.status(HttpStatus.OK).json(updatedUsager);
    }

    const annee = dateRdv.getFullYear();
    const mois = dateRdv.getMonth() + 1;
    const jour = dateRdv.getDate();
    const heure = dateRdv.getHours();
    const minutes = dateRdv.getMinutes();

    const invitation: ics.ReturnObject = ics.createEvent({
      title,
      description: "Entretien demande de domiciliation",
      start: [annee, mois, jour, heure, minutes],
      organizer: {
        name: currentUser.prenom + " " + currentUser.nom,
        email: currentUser.email,
      },
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
        { uuid: usager.uuid },
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
        throw new HttpException("UPDATE_RDV", HttpStatus.INTERNAL_SERVER_ERROR);
      }
    } else {
      throw new HttpException(
        "ICS_GENERATION",
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }
}
