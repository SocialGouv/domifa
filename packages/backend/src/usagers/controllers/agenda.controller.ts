import { UseGuards, Controller, Get } from "@nestjs/common";
import { AuthGuard } from "@nestjs/passport";
import { UsagersService } from "../services/usagers.service";
import { UsersService } from "../../users/services/users.service";
import { InteractionsService } from "../../interactions/interactions.service";
import { CerfaService } from "../services/cerfa.service";
import { CurrentUser } from "../../auth/current-user.decorator";
import { User } from "../../users/user.interface";
import { AccessGuard } from "../../auth/guards/access.guard";
import { Usager } from "../interfaces/usagers";

import * as ics from "ics";
import * as fs from "fs";
import { TipimailService } from "../../users/services/tipimail.service";

@UseGuards(AuthGuard("jwt"))
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

  @Get("")
  public async getAll(@CurrentUser() user: User) {
    return this.usagersService.agenda(user);
  }

  //

  @Get(":id/chips")
  public async get(@CurrentUser() user: User, @CurrentUser() usager: Usager) {
    ics.createEvent(
      {
        title: "Dinner",
        description: "Nightly thing I do",
        start: [2020, 9, 15, 6, 30],
        duration: { minutes: 30 },
      },
      (error, value) => {
        if (error) {
          console.log(error);
        }
        return this.tipimailService.mailRdv(user, usager, value);

        // TODO: ATTACHER AU MAIL LA PJ ICS
        /* mail.attachments = [
          {
            filename: "calendar.ics",
            content: base64Content,
            type: "text/Calendar",
          },


        ];*/
      }
    );
  }
}
