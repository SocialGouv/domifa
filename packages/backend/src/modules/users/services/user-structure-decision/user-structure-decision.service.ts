import { BadRequestException, Injectable } from "@nestjs/common";
import { format } from "date-fns";
import { v4 as uuidv4 } from "uuid";
import {
  UserDeleteMotif,
  USER_DELETE_MOTIF_LABELS,
  USER_DELETE_MOTIF_VALUES,
  UserStructureDecision,
  UserStructureRole,
} from "@domifa/common";

import { domifaConfig } from "../../../../config";
import { userStructureRepository } from "../../../../database";
import { BrevoSenderService } from "../../../mails/services/brevo-sender/brevo-sender.service";
import { AppLogsService } from "../../../app-logs/app-logs.service";
import {
  ActorFields,
  buildStructureActorFields,
  buildSupervisorActorFields,
} from "../../../app-logs/app-logs.helpers";
import { UserSoftDeleteLogContext } from "../../../app-logs/types/app-log-context.types";
import {
  UserAdminAuthenticated,
  UserStructureAuthenticated,
} from "../../../../_common/model";
import { appLogger } from "../../../../util";

export type SoftDeleteActor =
  | { kind: "structure"; user: UserStructureAuthenticated }
  | { kind: "supervisor"; user: UserAdminAuthenticated };

@Injectable()
export class UserStructureDecisionService {
  constructor(
    private readonly brevoSenderService: BrevoSenderService,
    private readonly appLogsService: AppLogsService
  ) {}

  public async softDelete({
    targetUserId,
    targetUserEmail,
    targetUserPrenom,
    targetUserRole,
    structureId,
    motif,
    actor,
  }: {
    targetUserId: number;
    targetUserEmail: string;
    targetUserPrenom: string;
    targetUserRole: UserStructureRole;
    structureId: number;
    motif: UserDeleteMotif;
    actor: SoftDeleteActor;
  }): Promise<void> {
    if (!USER_DELETE_MOTIF_VALUES.includes(motif)) {
      throw new BadRequestException("INVALID_USER_DELETE_MOTIF");
    }

    const decision: UserStructureDecision = {
      uuid: uuidv4(),
      dateDecision: new Date(),
      statut: "DELETE",
      motif,
      userId: actor.user.id,
      userName: `${actor.user.prenom} ${actor.user.nom}`,
    };

    await userStructureRepository.update(
      { id: targetUserId, structureId },
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

    try {
      await this.brevoSenderService.removeContactFromUsersList(targetUserEmail);
    } catch (error) {
      appLogger.warn(
        `Échec du retrait de la liste Brevo Utilisateurs pour ${targetUserEmail}`,
        error
      );
    }

    // Sent with the address captured before the update: the stored email is now
    // prefixed "deleted-", which `sendEmailWithTemplate` filters out.
    try {
      await this.brevoSenderService.sendEmailWithTemplate({
        templateId: domifaConfig().brevo.templates.userAccountDeleted,
        to: [{ email: targetUserEmail, name: targetUserPrenom }],
        params: {
          prenom: targetUserPrenom,
          motif: USER_DELETE_MOTIF_LABELS[motif],
        },
      });
    } catch (error) {
      appLogger.warn(
        `Échec de l'envoi de l'email de suppression de compte pour l'utilisateur ${targetUserId}`,
        error
      );
    }

    const actorFields: ActorFields =
      actor.kind === "structure"
        ? buildStructureActorFields(actor.user)
        : buildSupervisorActorFields(actor.user);

    await this.appLogsService.create<UserSoftDeleteLogContext>({
      ...actorFields,
      action: "ADMIN_SOFT_DELETE_USER_STRUCTURE",
      context: {
        userId: targetUserId,
        role: targetUserRole,
        motif,
      },
    });
  }
}
