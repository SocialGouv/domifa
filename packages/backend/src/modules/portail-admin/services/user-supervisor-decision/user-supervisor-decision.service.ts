import { BadRequestException, Injectable } from "@nestjs/common";
import { v4 as uuidv4 } from "uuid";
import {
  UserDeleteMotif,
  USER_DELETE_MOTIF_VALUES,
  UserSupervisorDecision,
  UserSupervisorRole,
} from "@domifa/common";

import {
  userSupervisorRepository,
  userSupervisorSecurityRepository,
} from "../../../../database";
import { AppLogsService } from "../../../app-logs/app-logs.service";
import { buildSupervisorActorFields } from "../../../app-logs/app-logs.helpers";
import { UserSoftDeleteLogContext } from "../../../app-logs/types/app-log-context.types";
import { UserAdminAuthenticated } from "../../../../_common/model";

@Injectable()
export class UserSupervisorDecisionService {
  constructor(private readonly appLogsService: AppLogsService) {}

  public async softDelete({
    targetUserId,
    targetUserRole,
    motif,
    admin,
  }: {
    targetUserId: number;
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

    await userSupervisorSecurityRepository.delete({ userId: targetUserId });

    await userSupervisorRepository.update(
      { id: targetUserId },
      { status: "DELETE", decision }
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
}
