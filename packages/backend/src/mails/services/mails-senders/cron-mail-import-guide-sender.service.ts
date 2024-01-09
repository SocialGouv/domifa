import { Injectable } from "@nestjs/common";
import { Cron } from "@nestjs/schedule";
import { sub, subDays } from "date-fns";

import { domifaConfig } from "../../../config";
import { isCronEnabled } from "../../../config/services/isCronEnabled.service";
import {
  cronMailsRepository,
  monitoringBatchProcessSimpleCountRunner,
  MonitoringBatchProcessTrigger,
  structureRepository,
} from "../../../database";
import { appLogger } from "../../../util";

import { guideImportEmailSender } from "../templates-renderers";
import { Structure } from "@domifa/common";

@Injectable()
export class CronMailImportGuideSenderService {
  @Cron(domifaConfig().cron.emailImportGuide.crontime)
  protected async sendMailImportCron() {
    if (!isCronEnabled()) {
      appLogger.warn(`[CRON] [sendMailImportCron] Disabled by config`);
      return;
    }

    await this.sendMailImports("cron");
  }

  public async sendMailImports(trigger: MonitoringBatchProcessTrigger) {
    appLogger.warn(`[CRON] [sendMailImports] Start`);
    await monitoringBatchProcessSimpleCountRunner.monitorProcess(
      {
        processId: "mail-import-guide",
        trigger,
      },
      async ({ monitorTotal, monitorSuccess, monitorError }) => {
        const users = await this._findUsersToSendImportGuide();
        monitorTotal(users.length);

        for (const user of users) {
          try {
            await guideImportEmailSender.sendMail({ user });

            await cronMailsRepository.updateMailFlag({
              userId: user.id,
              mailType: "import",
              value: true,
            });
            monitorSuccess();
          } catch (err: any) {
            const totalErrors = monitorError(err);
            if (totalErrors > 10) {
              appLogger.warn(
                `[CronMailImportGuideSenderService] Too many errors: skip next users: : ${err.message}`,
                {
                  sentry: true,
                }
              );
              break;
            }
          }
        }
      }
    );
  }

  private async _findUsersToSendImportGuide() {
    const delay = domifaConfig().cron.emailImportGuide.delay;

    const maxCreationDate = sub(new Date(), {
      [delay.unit]: delay.amount,
    });

    const minCreationDate: Date = subDays(new Date(maxCreationDate), 14);

    const structuresIds: number[] = [];

    const structures: Pick<Structure, "id">[] = await structureRepository.find({
      where: {
        import: false,
      },
      select: { id: true },
    });

    if (structures.length === 0) {
      return [];
    }

    for (const structure of structures) {
      structuresIds.push(structure.id);
    }

    return await cronMailsRepository.findUsersToSendCronMail({
      minCreationDate,
      maxCreationDate,
      structuresIds,
      mailType: "import",
    });
  }
}
