import { Body, Controller, Get, UseGuards } from "@nestjs/common";
import { AuthGuard } from "@nestjs/passport";
import { ApiBearerAuth, ApiTags } from "@nestjs/swagger";
import { UsagerAccessGuard } from "../auth/guards/usager-access.guard";
import { SuiviSmsDto } from "./suivi.dto";

@Controller("sms")
@ApiTags("sms")
export class SmsController {
  constructor() {}

  @Get("retour-api")
  // URL de retour de l'API Spot-Hit pour mettre à jour le statut d'un SMS
  public async retourApi(@Body() suiviSmsDto: SuiviSmsDto) {}

  @ApiBearerAuth()
  @UseGuards(AuthGuard("jwt"), UsagerAccessGuard)
  @Get("usager/:id")
  // Liste des SMS d'un usager
  public async getUsagerSms() {}
}
