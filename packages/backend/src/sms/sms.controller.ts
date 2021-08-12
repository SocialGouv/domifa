import { Body, Controller, Get, Param, UseGuards } from "@nestjs/common";
import { AuthGuard } from "@nestjs/passport";
import { ApiBearerAuth, ApiTags } from "@nestjs/swagger";
import { CurrentUsager } from "../auth/current-usager.decorator";
import { CurrentUser } from "../auth/current-user.decorator";
import { DomifaGuard } from "../auth/guards/domifa.guard";
import { UsagerAccessGuard } from "../auth/guards/usager-access.guard";
import { StructuresService } from "../structures/services/structures.service";
import { AppAuthUser, UsagerLight } from "../_common/model";
import { MessageSmsService } from "./services/message-sms.service";

@Controller("sms")
@ApiTags("sms")
export class SmsController {
  constructor(
    private readonly messageSmsService: MessageSmsService,
    private readonly structureService: StructuresService
  ) {}

  @UseGuards(AuthGuard("jwt"), DomifaGuard)
  @Get("enable/:structureId")
  public async enableByDomifa(@Param("structureId") structureId: number) {
    const structure = await this.structureService.findOneFull(structureId);
    const smsParams = structure.sms;
    smsParams.enabledByDomifa = !smsParams.enabledByDomifa;
    return this.messageSmsService.changeStatutByDomifa(structureId, smsParams);
  }

  @ApiBearerAuth()
  @UseGuards(AuthGuard("jwt"), UsagerAccessGuard)
  @Get("usager/:usagerRef")
  // Liste des SMS d'un usager
  public async getUsagerSms(
    @CurrentUser() user: AppAuthUser,
    @CurrentUsager() usager: UsagerLight
  ) {
    // 0. On récupère les sms
    const lastTenSms = await this.messageSmsService.findAll(usager);

    // Etape 1 : on met à jour le statut des 10 derniers SMS
    // Etape 2 : on renvoi les donnnnées
    const allSmsUpdated = [];
    for (const sms of lastTenSms) {
      if (sms.status !== "TO_SEND") {
        const smsUpdated = await this.messageSmsService.updateMessageSmsStatut(
          sms
        );
        allSmsUpdated.push(smsUpdated);
      } else {
        allSmsUpdated.push(sms);
      }
    }
    return allSmsUpdated;
  }
}
