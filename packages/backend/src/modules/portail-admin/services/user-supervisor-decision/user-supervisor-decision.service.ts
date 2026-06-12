import { BadRequestException, Injectable } from "@nestjs/common";
import { format } from "date-fns";
import { v4 as uuidv4 } from "uuid";
import {
  UserDeleteMotif,
  USER_DELETE_MOTIF_VALUES,
  UserSupervisorDecision,
  UserSupervisorRole,
} from "@domifa/common";

import { userSupervisorRepository } from "../../../../database";
import { AppLogsService } from "../../../app-logs/app-logs.service";
import { buildSupervisorActorFields } from "../../../app-logs/app-logs.helpers";
import { UserSoftDeleteLogContext } from "../../../app-logs/types/app-log-context.types";
import { UserAdminAuthenticated } from "../../../../_common/model";
import { BrevoSenderService } from "../../../mails/services/brevo-sender/brevo-sender.service";
import { appLogger } from "../../../../util";

@Injectable()
export class UserSupervisorDecisionService {
  constructor(
    private readonly appLogsService: AppLogsService,
    private readonly brevoSenderService: BrevoSenderService
  ) {}

  public async softDelete({
    targetUserId,
    targetUserEmail,
    targetUserRole,
    motif,
    admin,
  }: {
    targetUserId: number;
    targetUserEmail: string;
    targetUserRole: UserSupervisorRole;
    motif: UserDeleteMotif;
    admin: UserAdminAuthenticated;
  }): Promise<void> {
    if (!USER_DELETE_MOTIF_VALUES.includes(motif)) {
      throw new BadRequestException("INVALID_USER_DELETE_MOTIF");
    }

    const decision: UserSupervisorDecision = {
      uuid: uuidv4(),
      dateDecision: new Date(),
      statut: "DELETE",
      motif,
      userId: admin.id,
      userName: `${admin.prenom} ${admin.nom}`,
    };

    await userSupervisorRepository.update(
      { id: targetUserId },
      {
        status: "DELETE",
        decision,
        email: `deleted-${format(new Date(), "ddMMyyyy")}-${targetUserEmail}`,
      }
    );

    try {
      await this.brevoSenderService.deleteContactFromBrevo(targetUserEmail);
    } catch (error) {
      appLogger.warn(
        `Échec de la suppression du contact Brevo pour ${targetUserEmail}`,
        error
      );
    }

    await this.appLogsService.create<UserSoftDeleteLogContext>({
      ...buildSupervisorActorFields(admin),
      action: "ADMIN_SOFT_DELETE_USER_SUPERVISOR",
      context: {
        userId: targetUserId,
        role: targetUserRole,
        motif,
      },
    });
  }
}
