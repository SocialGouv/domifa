import { Injectable } from "@nestjs/common";
import { Cron, CronExpression } from "@nestjs/schedule";
import { SentryCron } from "@sentry/nestjs";
import { format, subMonths } from "date-fns";
import { In, Not } from "typeorm";

import { isCronEnabled } from "../../../../config/services/isCronEnabled.service";
import { domifaConfig } from "../../../../config";
import { InactiveUser, userStructureRepository } from "../../../../database";
import { appLogger } from "../../../../util";
import { BrevoSenderService } from "../../../mails/services/brevo-sender/brevo-sender.service";
import { UserStructureDecisionService } from "../user-structure-decision/user-structure-decision.service";

export const INACTIVE_USER_MONTHS = 13;

const formatDate = (date: Date | string | null): string =>
  date ? format(new Date(date), "dd/MM/yyyy") : "";

// Users reach this cron one month after the M+12 inactivity reminder (Brevo
// automation on USER_DERNIERE_CONNEXION). Structures where every user is
// inactive are not touched here: the inactive structures cron (4 AM) deletes
// them with all their users.
@Injectable()
export class InactiveUsersCleanerService {
  constructor(
    private readonly userStructureDecisionService: UserStructureDecisionService,
    private readonly brevoSenderService: BrevoSenderService
  ) {}

  @Cron(CronExpression.EVERY_DAY_AT_3AM, {
    timeZone: "Europe/Paris",
    disabled: !isCronEnabled(),
  })
  @SentryCron("inactive-users-cleaner", {
    schedule: {
      type: "crontab",
      value: CronExpression.EVERY_DAY_AT_3AM,
    },
    timezone: "Europe/Paris",
    checkinMargin: 10,
    maxRuntime: 60,
  })
  public async deleteInactiveUsersCron(): Promise<void> {
    await this.deleteInactiveUsers({
      dryRun: domifaConfig().cron.inactiveUsersDryRun,
    });
  }

  public async deleteInactiveUsers({
    dryRun,
  }: {
    dryRun: boolean;
  }): Promise<InactiveUser[]> {
    const users = await userStructureRepository.findInactiveUsers(
      subMonths(new Date(), INACTIVE_USER_MONTHS)
    );

    appLogger.info(
      `[CRON] [inactiveUsers] ${
        users.length
      } utilisateur(s) inactif(s) depuis ${INACTIVE_USER_MONTHS} mois${
        dryRun ? " (dry-run)" : ""
      }`
    );

    const deleted: InactiveUser[] = [];
    for (const structureUsers of this.groupByStructure(users)) {
      const structureId = structureUsers[0].structureId;
      const structureLeftWithoutAdmin = await this.isLeftWithoutAdmin(
        structureId,
        structureUsers
      );

      if (structureLeftWithoutAdmin) {
        appLogger.error(
          `[CRON] [inactiveUsers] La structure ${structureId} n'aura plus d'administrateur après la suppression des comptes inactifs${
            dryRun ? " (dry-run)" : ""
          }`,
          {
            sentry: !dryRun,
            context: {
              structureId,
              userIds: structureUsers.map(({ id }) => id),
            },
          }
        );
      }

      for (const user of structureUsers) {
        if (dryRun) {
          appLogger.info(
            `[CRON] [inactiveUsers] [dry-run] utilisateur ${user.id} (${
              user.role
            }) de la structure ${structureId} - date retenue ${formatDate(
              user.referenceDate
            )}`
          );
          deleted.push(user);
          continue;
        }

        try {
          await this.deleteInactiveUser(user, structureLeftWithoutAdmin);
          deleted.push(user);
        } catch (error) {
          appLogger.error(
            `[CRON] [inactiveUsers] Échec de la suppression de l'utilisateur ${user.id}`,
            { error, sentry: true, context: { userId: user.id, structureId } }
          );
        }
      }
    }
    return deleted;
  }

  private async deleteInactiveUser(
    user: InactiveUser,
    structureLeftWithoutAdmin: boolean
  ): Promise<void> {
    const deletedAt = new Date();

    // Same path as a manual deletion, without the manual deletion email
    await this.userStructureDecisionService.softDelete({
      targetUserId: user.id,
      targetUserEmail: user.email,
      targetUserPrenom: user.prenom,
      targetUserRole: user.role,
      structureId: user.structureId,
      motif: "INACTIF_PLUS_D_UN_AN",
      actor: { kind: "system" },
      logContext: {
        lastLogin: user.lastLogin,
        referenceDate: user.referenceDate,
        structureLeftWithoutAdmin:
          user.role === "admin" && structureLeftWithoutAdmin,
      },
    });

    appLogger.info(
      `[CRON] [inactiveUsers] Utilisateur ${user.id} de la structure ${
        user.structureId
      } supprimé (date retenue : ${formatDate(user.referenceDate)})`
    );

    // Address captured before the soft delete prefixed it with "deleted-"
    try {
      await this.brevoSenderService.sendEmailWithTemplate({
        templateId: domifaConfig().brevo.templates.userInactiveDelete,
        to: [{ email: user.email, name: user.prenom }],
        params: {
          prenom: user.prenom,
          nom: user.nom,
          structure_nom: user.structureNom,
          date_suppression: formatDate(deletedAt),
          date_derniere_connexion: formatDate(user.lastLogin),
        },
      });
    } catch (error) {
      appLogger.error(
        `[CRON] [inactiveUsers] Échec de l'envoi du mail de suppression pour l'utilisateur ${user.id}`,
        { error, sentry: true, context: { userId: user.id } }
      );
    }
  }

  // True when at least one admin is deleted and no other admin remains
  private async isLeftWithoutAdmin(
    structureId: number,
    structureUsers: InactiveUser[]
  ): Promise<boolean> {
    if (!structureUsers.some(({ role }) => role === "admin")) {
      return false;
    }
    const remainingAdmins = await userStructureRepository.count({
      where: {
        structureId,
        role: "admin",
        status: Not("DELETE"),
        id: Not(In(structureUsers.map(({ id }) => id))),
      },
    });
    return remainingAdmins === 0;
  }

  private groupByStructure(users: InactiveUser[]): InactiveUser[][] {
    const byStructure = new Map<number, InactiveUser[]>();
    for (const user of users) {
      const structureUsers = byStructure.get(user.structureId) ?? [];
      structureUsers.push(user);
      byStructure.set(user.structureId, structureUsers);
    }
    return [...byStructure.values()];
  }
}
