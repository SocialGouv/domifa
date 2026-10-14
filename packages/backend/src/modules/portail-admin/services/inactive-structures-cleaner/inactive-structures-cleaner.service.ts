import { Injectable } from "@nestjs/common";
import { Cron, CronExpression } from "@nestjs/schedule";
import { SentryCron } from "@sentry/nestjs";
import { format, subMonths } from "date-fns";
import { StructureDecisionSuppressionMotif } from "@domifa/common";

import { isCronEnabled } from "../../../../config/services/isCronEnabled.service";
import { domifaConfig } from "../../../../config";
import {
  appLogsRepository,
  InactiveStructure,
  structureRepository,
  userStructureRepository,
} from "../../../../database";
import { appLogger } from "../../../../util";
import { SYSTEM_ACTOR_FIELDS } from "../../../app-logs/app-logs.helpers";
import { StructureDecisionService } from "../structure-decision/structure-decision.service";
import { StructureDecisionEmailService } from "../structure-decision-email/structure-decision-email.service";

export const INACTIVE_STRUCTURE_MONTHS = 13;

const SYSTEM_DECISION_USER = { userId: 0, userName: "DomiFa (automatique)" };

@Injectable()
export class InactiveStructuresCleanerService {
  constructor(
    private readonly structureDecisionService: StructureDecisionService,
    private readonly structureDecisionEmailService: StructureDecisionEmailService
  ) {}

  @Cron(CronExpression.EVERY_DAY_AT_4AM, {
    timeZone: "Europe/Paris",
    disabled: !isCronEnabled(),
  })
  @SentryCron("inactive-structures-cleaner", {
    schedule: {
      type: "crontab",
      value: CronExpression.EVERY_DAY_AT_4AM,
    },
    timezone: "Europe/Paris",
    checkinMargin: 10,
    maxRuntime: 60,
  })
  public async deleteInactiveStructuresCron(): Promise<void> {
    await this.deleteInactiveStructures({
      dryRun: domifaConfig().cron.inactiveStructuresDryRun,
    });
  }

  public async deleteInactiveStructures({
    dryRun,
  }: {
    dryRun: boolean;
  }): Promise<InactiveStructure[]> {
    const structures = await structureRepository.findInactiveStructures(
      subMonths(new Date(), INACTIVE_STRUCTURE_MONTHS)
    );

    appLogger.info(
      `[CRON] [inactiveStructures] ${
        structures.length
      } structure(s) inactive(s) depuis ${INACTIVE_STRUCTURE_MONTHS} mois${
        dryRun ? " (dry-run)" : ""
      }`
    );

    if (dryRun) {
      for (const structure of structures) {
        appLogger.info(
          `[CRON] [inactiveStructures] [dry-run] structure ${structure.id} "${
            structure.nom
          }" - date retenue ${format(
            new Date(structure.referenceDate),
            "dd/MM/yyyy"
          )}`
        );
      }
      return structures;
    }

    const deleted: InactiveStructure[] = [];
    for (const structure of structures) {
      try {
        await this.deleteInactiveStructure(structure);
        deleted.push(structure);
      } catch (error) {
        appLogger.error(
          `[CRON] [inactiveStructures] Échec de la suppression de la structure ${structure.id}`,
          { error }
        );
      }
    }
    return deleted;
  }

  private async deleteInactiveStructure(
    structure: InactiveStructure
  ): Promise<void> {
    // Recipients must be read before users are deleted
    const recipients = await this.getRecipients(structure);
    const deletedAt = new Date();

    // Same path as a manual deletion from the admin portal
    await this.structureDecisionService.updateStructureStatut(
      structure.id,
      "SUPPRIME",
      {
        statut: "SUPPRIME",
        dateDecision: deletedAt,
        motif: StructureDecisionSuppressionMotif.INACTIF,
        ...SYSTEM_DECISION_USER,
      }
    );
    await this.structureDecisionService.deleteStructureData(structure);

    await appLogsRepository.save(
      appLogsRepository.create({
        ...SYSTEM_ACTOR_FIELDS,
        structureId: structure.id,
        action: "STRUCTURE_INACTIVE_AUTO_DELETE",
        context: {
          deletedAt,
          referenceDate: structure.referenceDate,
          lastLogin: structure.lastLogin,
          registrationDate: structure.registrationDate,
        },
      })
    );

    appLogger.info(
      `[CRON] [inactiveStructures] Structure ${
        structure.id
      } supprimée (date retenue : ${format(
        new Date(structure.referenceDate),
        "dd/MM/yyyy"
      )})`
    );

    const params = {
      structure_nom: structure.nom,
      date_suppression: format(deletedAt, "dd/MM/yyyy"),
      date_derniere_connexion: structure.lastLogin
        ? format(new Date(structure.lastLogin), "dd/MM/yyyy")
        : "",
    };

    for (const recipient of recipients) {
      try {
        await this.structureDecisionEmailService.sendInactiveStructureDeletedEmail(
          {
            to: { email: recipient.email, name: recipient.prenom },
            params: { ...params, prenom: recipient.prenom },
          }
        );
      } catch (error) {
        appLogger.error(
          `[CRON] [inactiveStructures] Échec de l'envoi du mail de suppression pour la structure ${structure.id}`,
          { error }
        );
      }
    }
  }

  // Structure admins + structure contact email, deduplicated
  private async getRecipients(
    structure: InactiveStructure
  ): Promise<Array<{ email: string; prenom: string }>> {
    const admins = await userStructureRepository.find({
      where: { structureId: structure.id, role: "admin" },
      select: { email: true, prenom: true },
    });

    const recipients = new Map<string, { email: string; prenom: string }>();
    for (const admin of admins) {
      recipients.set(admin.email.toLowerCase(), {
        email: admin.email,
        prenom: admin.prenom,
      });
    }
    if (structure.email && !recipients.has(structure.email.toLowerCase())) {
      recipients.set(structure.email.toLowerCase(), {
        email: structure.email,
        prenom: "",
      });
    }
    return [...recipients.values()];
  }
}
