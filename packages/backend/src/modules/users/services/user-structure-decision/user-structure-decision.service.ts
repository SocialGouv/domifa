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

import { userStructureRepository } from "../../../../database";
import { domifaConfig } from "../../../../config";
import { BrevoSenderService } from "../../../mails/services/brevo-sender/brevo-sender.service";
import { AppLogsService } from "../../../app-logs/app-logs.service";
import {
  ActorFields,
  buildStructureActorFields,
  buildSupervisorActorFields,
  SYSTEM_ACTOR_FIELDS,
} from "../../../app-logs/app-logs.helpers";
import { UserSoftDeleteLogContext } from "../../../app-logs/types/app-log-context.types";
import {
  UserAdminAuthenticated,
  UserStructureAuthenticated,
} from "../../../../_common/model";
import { appLogger } from "../../../../util";

export type SoftDeleteActor =
  | { kind: "structure"; user: UserStructureAuthenticated }
  | { kind: "supervisor"; user: UserAdminAuthenticated }
  // Automatic deletion of inactive accounts: no email is sent here, the cron
  // sends its own
  | { kind: "system" };

const SYSTEM_DECISION_USER = { userId: 0, userName: "DomiFa (automatique)" };

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
    logContext,
  }: {
    targetUserId: number;
    targetUserEmail: string;
    targetUserPrenom: string;
    targetUserRole: UserStructureRole;
    structureId: number;
    motif: UserDeleteMotif;
    actor: SoftDeleteActor;
    logContext?: Pick<
      UserSoftDeleteLogContext,
      "lastLogin" | "referenceDate" | "structureLeftWithoutAdmin"
    >;
  }): Promise<void> {
    if (!USER_DELETE_MOTIF_VALUES.includes(motif)) {
      throw new BadRequestException("INVALID_USER_DELETE_MOTIF");
    }

    const decision: UserStructureDecision = {
      uuid: uuidv4(),
      dateDecision: new Date(),
      statut: "DELETE",
      motif,
      ...(actor.kind === "system"
        ? SYSTEM_DECISION_USER
        : {
            userId: actor.user.id,
            userName: `${actor.user.prenom} ${actor.user.nom}`,
          }),
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

    const actorFields: ActorFields =
      actor.kind === "structure"
        ? buildStructureActorFields(actor.user)
        : actor.kind === "supervisor"
        ? buildSupervisorActorFields(actor.user)
        : { ...SYSTEM_ACTOR_FIELDS, structureId };

    await this.appLogsService.create<UserSoftDeleteLogContext>({
      ...actorFields,
      action:
        actor.kind === "system"
          ? "USER_INACTIVE_AUTO_DELETE"
          : "ADMIN_SOFT_DELETE_USER_STRUCTURE",
      context: {
        userId: targetUserId,
        role: targetUserRole,
        motif,
        ...logContext,
      },
    });

    if (actor.kind !== "system") {
      await this.sendManualDeletionEmail({
        targetUserId,
        email: targetUserEmail,
        prenom: targetUserPrenom,
        motif,
      });
    }
  }

  // Address passed in is the one captured before the soft delete: the stored
  // one is now prefixed "deleted-", which `sendEmailWithTemplate` filters out.
  private async sendManualDeletionEmail({
    targetUserId,
    email,
    prenom,
    motif,
  }: {
    targetUserId: number;
    email: string;
    prenom: string;
    motif: UserDeleteMotif;
  }): Promise<void> {
    try {
      await this.brevoSenderService.sendEmailWithTemplate({
        templateId: domifaConfig().brevo.templates.userManualDelete,
        to: [{ email, name: prenom }],
        params: {
          prenom,
          motif: USER_DELETE_MOTIF_LABELS[motif],
        },
      });
    } catch (error) {
      appLogger.error(
        `Échec de l'envoi de l'email de suppression de compte pour l'utilisateur ${targetUserId}`,
        { error, sentry: true, context: { userId: targetUserId } }
      );
    }
  }
}
