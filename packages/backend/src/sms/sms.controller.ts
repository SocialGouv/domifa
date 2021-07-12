import {
  Body,
  Controller,
  Get,
  Param,
  UseGuards,
  UsePipes,
  ValidationPipe,
} from "@nestjs/common";
import { AuthGuard } from "@nestjs/passport";
import { ApiBearerAuth, ApiTags } from "@nestjs/swagger";
import { CurrentUser } from "../auth/current-user.decorator";
import { DomifaGuard } from "../auth/guards/domifa.guard";
import { UsagerAccessGuard } from "../auth/guards/usager-access.guard";
import { StructuresService } from "../structures/services/structures.service";
import { AppAuthUser } from "../_common/model";
import { MessageSmsService } from "./services/message-sms.service";
import { SpotHitPushDecorator } from "./SpotHitPushDecorator";
import { SuiviSmsDto } from "./suivi-sms.dto";

@Controller("sms")
@ApiTags("sms")
export class SmsController {
  constructor(
    private readonly smsService: MessageSmsService,
    private readonly structureService: StructuresService
  ) {}

  @UseGuards(AuthGuard("jwt"))
  @Get("timeline")
  // URL de retour de l'API Spot-Hit pour mettre à jour le statut d'un SMS
  public async getTimeline(@CurrentUser() user: AppAuthUser) {
    return this.smsService.getTimeline(user);
  }

  @UseGuards(AuthGuard("jwt"), DomifaGuard)
  @Get("enable/:structureId")
  public async enableByDomifa(@Param("structureId") structureId: number) {
    const structure = await this.structureService.findOneFull(structureId);
    const smsParams = structure.sms;
    smsParams.enabledByDomifa = !smsParams.enabledByDomifa;
    return this.smsService.changeStatutByDomifa(structureId, smsParams);
  }

  @UsePipes(new ValidationPipe({ transform: true }))
  @Get("retour-api")
  public async getHello(@SpotHitPushDecorator() suiviSmsDto: SuiviSmsDto) {
    // URL de retour de l'API Spot-Hit pour mettre à jour le statut d'un SMS
    return this.smsService.updateMessageSmsStatut(suiviSmsDto);
  }

  @ApiBearerAuth()
  @UseGuards(AuthGuard("jwt"), UsagerAccessGuard)
  @Get("usager/:id")
  // Liste des SMS d'un usager
  public async getUsagerSms() {}
}
