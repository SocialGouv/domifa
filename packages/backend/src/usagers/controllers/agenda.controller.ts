import {
  Body,
  Controller,
  Get,
  HttpException,
  HttpStatus,
  Post,
  Response,
  UseGuards,
} from "@nestjs/common";
import { AuthGuard } from "@nestjs/passport";
import { ApiBearerAuth, ApiTags } from "@nestjs/swagger";
import * as ics from "ics";
import { CurrentUsager } from "../../auth/current-usager.decorator";
import { CurrentUser } from "../../auth/current-user.decorator";
import { FacteurGuard } from "../../auth/guards/facteur.guard";
import { UsagerAccessGuard } from "../../auth/guards/usager-access.guard";
import { domifaConfig } from "../../config";
import { MessageEmailIcalEvent, usersRepository } from "../../database";
import {
  usagerAppointmentCreatedEmailSender,
  UsagersMailsService,
} from "../../mails/services";
import { AppAuthUser, UserProfile } from "../../_common/model";
import { RdvDto } from "../dto/rdv.dto";
import { Usager } from "../interfaces/usagers";
import { UsagersService } from "../services/usagers.service";

@ApiTags("agenda")
@ApiBearerAuth()
@Controller("agenda")
export class AgendaController {
  constructor(
    private usagersService: UsagersService,
    private mailService: UsagersMailsService
  ) {}

  // AGENDA des rendez-vous

  @Post(":id")
  @UseGuards(AuthGuard("jwt"), FacteurGuard, UsagerAccessGuard)
  public async postRdv(
    @Body() rdvDto: RdvDto,
    @CurrentUser() currentUser: AppAuthUser,
    @CurrentUsager() usager: Usager,
    @Response() res: any
  ) {
    const user = await usersRepository.findOne({
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
    const annee = dateRdv.getFullYear();
    const mois = dateRdv.getMonth() + 1;
    const jour = dateRdv.getDate();
    const heure = dateRdv.getHours();
    const minutes = dateRdv.getMinutes();

    if (rdvDto.isNow) {
      rdvDto.dateRdv = new Date();
      rdvDto.dateRdv.setSeconds(0);

      const updatedUsager = await this.usagersService.setRdv(
        usager.id,
        rdvDto,
        user
      );

      return res.status(HttpStatus.OK).json(updatedUsager);
    }

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
        usager.id,
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

  @Get("users")
  @UseGuards(AuthGuard("jwt"), FacteurGuard)
  public getUsersMeeting(
    @CurrentUser() user: AppAuthUser
  ): Promise<UserProfile[]> {
    return usersRepository.findVerifiedStructureUsersByRoles({
      structureId: user.structureId,
      roles: ["admin", "simple", "responsable"],
    });
  }

  @Get("")
  @UseGuards(AuthGuard("jwt"), FacteurGuard)
  public async getAll(@CurrentUser() user: AppAuthUser) {
    return this.usagersService.agenda(user.id);
  }

  //
}
