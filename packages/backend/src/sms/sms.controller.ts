import { Controller, Get, Param, Put, UseGuards } from "@nestjs/common";
import { AuthGuard } from "@nestjs/passport";
import { ApiBearerAuth, ApiTags } from "@nestjs/swagger";
import { CurrentUsager } from "../auth/current-usager.decorator";
import { CurrentUser } from "../auth/current-user.decorator";
import { AllowUserProfiles, AppUserGuard } from "../auth/guards";
import { UsagerAccessGuard } from "../auth/guards/usager-access.guard";
import { StructuresService } from "../structures/services/structures.service";
import { UsagerLight, UserStructureAuthenticated } from "../_common/model";
import { MessageSmsService } from "./services/message-sms.service";
@Controller("sms")
@UseGuards(AuthGuard("jwt"), AppUserGuard)
@ApiTags("sms")
export class SmsController {
  constructor(
    private readonly messageSmsService: MessageSmsService,
    private readonly structureService: StructuresService
  ) {}

  @AllowUserProfiles("super-admin-domifa")
  @Put("enable/:structureId")
  public async enableByDomifa(@Param("structureId") structureId: number) {
    const structure = await this.structureService.findOneFull(structureId);

    structure.sms.enabledByDomifa = !structure.sms.enabledByDomifa;

    if (!structure.sms.enabledByDomifa) {
      structure.sms.enabledByStructure = false;
    }

    return this.messageSmsService.changeStatutByDomifa(
      structureId,
      structure.sms
    );
  }

  @ApiBearerAuth()
  @AllowUserProfiles("structure")
  @UseGuards(AuthGuard("jwt"), AppUserGuard, UsagerAccessGuard)
  @Get("usager/:usagerRef")
  // Liste des SMS d'un usager
  public async getUsagerSms(
    @CurrentUser() user: UserStructureAuthenticated,
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
