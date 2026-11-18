import { Injectable } from "@nestjs/common";
import { Cron, CronExpression } from "@nestjs/schedule";
import { SentryCron } from "@sentry/nestjs";
import { format, subMonths } from "date-fns";
import { In, LessThanOrEqual, Not, Raw } from "typeorm";

import { domifaConfig } from "../../../../config";
import { isCronEnabled } from "../../../../config/services/isCronEnabled.service";
import {
  appLogsRepository,
  userSupervisorRepository,
} from "../../../../database";
import { UserSupervisorTable } from "../../../../database/entities/user-supervisor";
import { appLogger } from "../../../../util";
import { AppLogsService } from "../../../app-logs/app-logs.service";
import { BrevoSenderService } from "../../../mails/services/brevo-sender/brevo-sender.service";
import { StructureDecisionEmailService } from "../structure-decision-email/structure-decision-email.service";
import { UserSupervisorDecisionService } from "../user-supervisor-decision/user-supervisor-decision.service";
import {
  getScheduledDeletionDate,
  getSupervisorInactivityAction,
  SupervisorInactivityCandidate,
  SUPERVISOR_INACTIVITY_REMINDER_MONTHS,
  SUPERVISOR_INACTIVITY_ROLES,
} from "./supervisor-inactivity.helpers";

const CRON_SCHEDULE = CronExpression.EVERY_DAY_AT_10AM;
const REMINDER_LOG_ACTION = "AUTO_INACTIVITY_REMINDER_USER_SUPERVISOR";

type Candidate = Pick<
  UserSupervisorTable,
  "id" | "email" | "nom" | "prenom" | "role" | "lastLogin" | "createdAt"
> &
  SupervisorInactivityCandidate;

export type SupervisorInactivityReport = {
  reminded: number;
  deleted: number;
  errors: number;
};

@Injectable()
export class SupervisorInactivityCleanerService {
  constructor(
    private readonly appLogsService: AppLogsService,
    private readonly brevoSenderService: BrevoSenderService,
    private readonly structureDecisionEmailService: StructureDecisionEmailService,
    private readonly userSupervisorDecisionService: UserSupervisorDecisionService
  ) {}

  @Cron(CRON_SCHEDULE, {
    timeZone: "Europe/Paris",
    disabled: !isCronEnabled() || domifaConfig().envId !== "prod",
  })
  @SentryCron("supervisor-inactivity-cleaner", {
    schedule: { type: "crontab", value: CRON_SCHEDULE },
    timezone: "Europe/Paris",
    checkinMargin: 10,
    maxRuntime: 30,
  })
  public async cleanInactiveSupervisorsCron(): Promise<void> {
    await this.cleanInactiveSupervisors();
  }

  public async cleanInactiveSupervisors(
    now: Date = new Date()
  ): Promise<SupervisorInactivityReport> {
    const report: SupervisorInactivityReport = {
      reminded: 0,
      deleted: 0,
      errors: 0,
    };

    // Without the reminder template no one can be warned, hence no one is
    // deleted either.
    const reminderTemplateId =
      domifaConfig().brevo.templates.userAccountInactivityReminder;
    if (!reminderTemplateId) {
      appLogger.warn(
        "[SUPERVISOR INACTIVITY] DOMIFA_BREVO_TEMPLATES_USER_ACCOUNT_INACTIVITY_REMINDER non défini, traitement ignoré"
      );
      return report;
    }

    const candidates = await this.findCandidates(now);

    for (const user of candidates) {
      const action = getSupervisorInactivityAction(user, now);
      try {
        if (action === "REMIND") {
          await this.sendReminder(user, reminderTemplateId, now);
          report.reminded++;
        } else if (action === "DELETE") {
          await this.deleteAccount(user);
          report.deleted++;
        }
      } catch (error) {
        report.errors++;
        appLogger.error(
          `[SUPERVISOR INACTIVITY] Échec ${action} (userId: ${user.id})`,
          { error }
        );
      }
    }

    appLogger.info(
      `[SUPERVISOR INACTIVITY] ${report.reminded} rappels, ${report.deleted} suppressions, ${report.errors} erreurs`
    );
    return report;
  }

  private async findCandidates(now: Date): Promise<Candidate[]> {
    const threshold = subMonths(now, SUPERVISOR_INACTIVITY_REMINDER_MONTHS);
    const users = await userSupervisorRepository.find({
      where: {
        role: In(SUPERVISOR_INACTIVITY_ROLES),
        status: Not("DELETE"),
        email: Raw((alias) => `${alias} NOT ILIKE 'deleted-%'`),
        // Same reference as getInactivityReferenceDate: last login, or
        // creation date for accounts that never logged in.
        createdAt: LessThanOrEqual(threshold),
        lastLogin: Raw(
          (alias) => `(${alias} IS NULL OR ${alias} <= :threshold)`,
          { threshold }
        ),
      },
      select: {
        id: true,
        email: true,
        nom: true,
        prenom: true,
        role: true,
        lastLogin: true,
        createdAt: true,
      },
    });

    const lastReminders = await this.findLastReminders(
      users.map((user) => user.id)
    );
    return users.map((user) => ({
      ...user,
      lastReminderAt: lastReminders.get(user.id) ?? null,
    }));
  }

  // Reminders are traced in app_log, which also keeps the proof that the
  // user was warned before the deletion.
  private async findLastReminders(
    userIds: number[]
  ): Promise<Map<number, Date>> {
    if (userIds.length === 0) {
      return new Map();
    }
    const rows: Array<{ userId: number; lastReminderAt: Date }> =
      await appLogsRepository
        .createQueryBuilder("log")
        .select(`log."userId"`, "userId")
        .addSelect(`MAX(log."createdAt")`, "lastReminderAt")
        .where(`log.action = :action`, { action: REMINDER_LOG_ACTION })
        .andWhere(`log."userType" = 'user_supervisor'`)
        .andWhere(`log."userId" IN (:...userIds)`, { userIds })
        .groupBy(`log."userId"`)
        .getRawMany();
    return new Map(
      rows.map((row) => [Number(row.userId), new Date(row.lastReminderAt)])
    );
  }

  private async sendReminder(
    user: Candidate,
    templateId: number,
    now: Date
  ): Promise<void> {
    const scheduledDeletionDate = getScheduledDeletionDate(user, now);
    await this.brevoSenderService.sendEmailWithTemplate({
      templateId,
      to: [{ email: user.email, name: `${user.prenom} ${user.nom}` }],
      params: {
        prenom: user.prenom,
        dateSuppression: format(scheduledDeletionDate, "dd/MM/yyyy"),
        lien: domifaConfig().apps.portailStatsUrl,
      },
    });
    // Only logged once the email went out: an account is never deleted
    // without a reminder. The reminded user is the subject of the log row.
    await this.appLogsService.create({
      userId: user.id,
      userSupervisorId: user.id,
      userType: "user_supervisor",
      role: user.role,
      action: REMINDER_LOG_ACTION,
      context: {
        scheduledDeletionDate,
      },
    });
  }

  private async deleteAccount(user: Candidate): Promise<void> {
    await this.userSupervisorDecisionService.softDeleteInactive({
      targetUserId: user.id,
      targetUserEmail: user.email,
      targetUserRole: user.role,
    });

    try {
      await this.structureDecisionEmailService.sendUserAccountDeletedEmail({
        email: user.email,
        prenom: user.prenom,
        motif: "INACTIF_18_MOIS",
      });
    } catch (error) {
      appLogger.error(
        `[SUPERVISOR INACTIVITY] Email de confirmation de suppression non envoyé (userId: ${user.id})`,
        { error }
      );
    }
  }
}
