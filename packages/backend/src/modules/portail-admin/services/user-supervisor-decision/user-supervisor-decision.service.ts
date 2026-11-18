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

type SoftDeleteTarget = {
  targetUserId: number;
  targetUserEmail: string;
  targetUserRole: UserSupervisorRole;
};

// Name stored in the decision when the deletion is made by the system
export const SYSTEM_DECISION_USER_NAME = "DomiFa (suppression automatique)";

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
  }: SoftDeleteTarget & {
    motif: UserDeleteMotif;
    admin: UserAdminAuthenticated;
  }): Promise<void> {
    if (!USER_DELETE_MOTIF_VALUES.includes(motif)) {
      throw new BadRequestException("INVALID_USER_DELETE_MOTIF");
    }

    await this.applySoftDelete(
      { targetUserId, targetUserEmail },
      {
        uuid: uuidv4(),
        dateDecision: new Date(),
        statut: "DELETE",
        motif,
        userId: admin.id,
        userName: `${admin.prenom} ${admin.nom}`,
      }
    );

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

  // Automatic deletion of a pilotage account inactive for 18 months.
  public async softDeleteInactive({
    targetUserId,
    targetUserEmail,
    targetUserRole,
  }: SoftDeleteTarget): Promise<void> {
    const motif: UserDeleteMotif = "INACTIF_18_MOIS";

    await this.applySoftDelete(
      { targetUserId, targetUserEmail },
      {
        uuid: uuidv4(),
        dateDecision: new Date(),
        statut: "DELETE",
        motif,
        userId: 0,
        userName: SYSTEM_DECISION_USER_NAME,
      }
    );

    // The deleted user is the subject of the log row, so it shows up in
    // their history.
    await this.appLogsService.create<UserSoftDeleteLogContext>({
      userId: targetUserId,
      userSupervisorId: targetUserId,
      userType: "user_supervisor",
      role: targetUserRole,
      action: "AUTO_DELETE_INACTIVE_USER_SUPERVISOR",
      context: {
        userId: targetUserId,
        role: targetUserRole,
        motif,
      },
    });
  }

  private async applySoftDelete(
    {
      targetUserId,
      targetUserEmail,
    }: Pick<SoftDeleteTarget, "targetUserId" | "targetUserEmail">,
    decision: UserSupervisorDecision
  ): Promise<void> {
    await userSupervisorRepository.update(
      { id: targetUserId },
      {
        status: "DELETE",
        decision,
        email: `deleted-${format(new Date(), "ddMMyyyy")}-${targetUserEmail}`,
      }
    );

    try {
      await this.brevoSenderService.updateContactStatusInBrevo(
        targetUserEmail,
        "DELETE"
      );
    } catch (error) {
      appLogger.warn(
        `Échec de la mise à jour du statut Brevo pour ${targetUserEmail}`,
        error
      );
    }
  }
}
