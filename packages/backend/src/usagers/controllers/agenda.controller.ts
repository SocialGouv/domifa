import {
  UseGuards,
  Controller,
  Get,
  Post,
  Body,
  HttpException,
  HttpStatus,
  Response,
} from "@nestjs/common";
import { AuthGuard } from "@nestjs/passport";
import { UsagersService } from "../services/usagers.service";
import { UsersService } from "../../users/services/users.service";
import { CurrentUser } from "../../auth/current-user.decorator";
import { User } from "../../users/user.interface";

import { Usager } from "../interfaces/usagers";

import * as ics from "ics";

import { TipimailService } from "../../users/services/tipimail.service";
import { FacteurGuard } from "../../auth/guards/facteur.guard";
import { CurrentUsager } from "../../auth/current-usager.decorator";
import { UsagerAccessGuard } from "../../auth/guards/usager-access.guard";
import { RdvDto } from "../dto/rdv.dto";
import { ApiTags, ApiBearerAuth } from "@nestjs/swagger";

@UseGuards(AuthGuard("jwt"))
@UseGuards(FacteurGuard)
@ApiTags("agenda")
  @ApiBearerAuth()
@Controller("agenda")
export class AgendaController {
  constructor(
    private readonly usagersService: UsagersService,
    private readonly tipimailService: TipimailService,
    private readonly usersService: UsersService
  ) {}

  // AGENDA des rendez-vous

  @Post(":id")
  @UseGuards(UsagerAccessGuard)
  public async postRdv(
    @Body() rdvDto: RdvDto,
    @CurrentUser() currentUser: User,
    @CurrentUsager() usager: Usager,
    @Response() res: any
  ) {
    const user: User = await this.usersService.findOne({
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

    if (rdvDto.isNow === "oui") {
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

    if (invitation.value && invitation.value !== null) {
      const attachment = Buffer.from(invitation.value).toString("base64");
      let msg = "";
      if (currentUser.id !== user.id) {
        msg =
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
        this.tipimailService.mailRdv(user, updatedUsager, attachment, msg).then(
          (result) => {
            return res.status(HttpStatus.OK).json(updatedUsager);
          },
          (error) => {
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
  public getUsersMeeting(@CurrentUser() user: User): Promise<User[]> {
    return this.usersService.findAll({
      structureId: user.structureId,
      role: { $in: ["admin", "simple", "responsable"] },
      verified: true,
    });
  }

  @Get("")
  public async getAll(@CurrentUser() user: User) {
    return this.usagersService.agenda(user);
  }

  //
}
