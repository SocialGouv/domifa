import {
  UseGuards,
  Controller,
  Get,
  Post,
  Body,
  HttpException,
  HttpStatus,
} from "@nestjs/common";
import { AuthGuard } from "@nestjs/passport";
import { UsagersService } from "../services/usagers.service";
import { UsersService } from "../../users/services/users.service";
import { InteractionsService } from "../../interactions/interactions.service";
import { CerfaService } from "../services/cerfa.service";
import { CurrentUser } from "../../auth/current-user.decorator";
import { User } from "../../users/user.interface";

import { Usager } from "../interfaces/usagers";

import * as ics from "ics";

import { TipimailService } from "../../users/services/tipimail.service";
import { FacteurGuard } from "../../auth/guards/facteur.guard";
import { CurrentUsager } from "../../auth/current-usager.decorator";
import { AccessGuard } from "../../auth/guards/access.guard";
import { RdvDto } from "../dto/rdv.dto";

@UseGuards(AuthGuard("jwt"))
@UseGuards(FacteurGuard)
@Controller("agenda")
export class AgendaController {
  constructor(
    private readonly usagersService: UsagersService,
    private readonly tipimailService: TipimailService,
    private readonly usersService: UsersService,
    private readonly interactionService: InteractionsService,
    private readonly cerfaService: CerfaService
  ) {}

  // AGENDA des rendez-vous

  @Post(":id")
  @UseGuards(AccessGuard)
  public async postRdv(
    @Body() rdvDto: RdvDto,
    @CurrentUser() currentUser: User,
    @CurrentUsager() usager: Usager
  ) {
    const user: User = await this.usersService.findOne({
      id: rdvDto.userId,
      structureId: currentUser.structureId,
    });

    usager = await this.usagersService.setRdv(usager.id, rdvDto, user);

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

    const invitation = ics.createEvent({
      title,
      description: "Entretien demande de domiciliation",
      start: [annee, mois, jour, heure, minutes],
      organizer: {
        name: currentUser.prenom + " " + currentUser.nom,
        email: currentUser.email,
      },
      duration: { minutes: 30 },
    });

    if (invitation.error === null) {
      let msg = "";
      if (currentUser.id !== user.id) {
        msg =
          "Il vous a été assigné par " +
          currentUser.prenom +
          " " +
          currentUser.nom;
      }

      return this.tipimailService
        .mailRdv(user, usager, invitation, msg)
        .then((res) => {
          return usager;
        })
        .catch((err) => {
          throw new HttpException(
            "MAIL_ENTRETIEN",
            HttpStatus.INTERNAL_SERVER_ERROR
          );
        });
    } else {
      throw new HttpException(
        "ICS_GENERATION",
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  @Get("")
  public async getAll(@CurrentUser() user: User) {
    return this.usagersService.agenda(user);
  }

  //

  @Get("users")
  public getUsersMeeting(@CurrentUser() user: User): Promise<User[]> {
    return this.usersService.findAll({
      structureId: user.structureId,
      role: { $in: ["admin", "simple", "responsable"] },
      verified: true,
    });
  }
}
