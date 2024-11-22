import { Injectable } from "@nestjs/common";
import { Cron } from "@nestjs/schedule";
import { concatMap, debounceTime, from } from "rxjs";

import { addMinutes } from "date-fns";
import { LessThanOrEqual } from "typeorm";
import { domifaConfig } from "../../../../config";
import { isCronEnabled } from "../../../../config/services/isCronEnabled.service";
import {
  MonitoringBatchProcessTrigger,
  monitoringBatchProcessSimpleCountRunner,
  messageEmailRepository,
  MessageEmailContent,
} from "../../../../database";
import { appLogger } from "../../../../util";
import { messageEmailConsummerTrigger } from "./message-email-consumer-trigger.service";
import { smtpSender } from "./smtpSender.service";

@Injectable()
export class MessageEmailConsummer {
  constructor() {
    messageEmailConsummerTrigger.trigger$
      .pipe(
        debounceTime(1000),
        concatMap((trigger: MonitoringBatchProcessTrigger) =>
          from(this.consumeEmails(trigger))
        )
      )
      .subscribe();
  }

  @Cron(domifaConfig().cron.emailConsumer.crontime)
  protected async consumeEmailsCron() {
    if (!isCronEnabled()) {
      appLogger.debug("[CRON] [consumeEmailsCron] Disabled by config");
      return;
    }

    messageEmailConsummerTrigger.triggerNextSending("cron");
  }

  protected async consumeEmails(trigger: MonitoringBatchProcessTrigger) {
    appLogger.warn("[CRON] [consumeEmails] Start");
    await monitoringBatchProcessSimpleCountRunner.monitorProcess(
      {
        processId: "mail-messages-consumer",
        trigger,
      },
      async ({ monitorTotal, monitorSuccess, monitorError }) => {
        const now = new Date();
        const messageEmails = await messageEmailRepository.findBy({
          status: "pending",
          nextScheduledDate: LessThanOrEqual(now),
        });

        appLogger.debug(`${messageEmails.length} mails à traiter`);
        monitorTotal(messageEmails.length);

        for (const messageEmail of messageEmails) {
          try {
            const content = messageEmail.content as Omit<
              MessageEmailContent,
              "hexEncoder"
            >;
            messageEmail.sendDetails = await smtpSender.sendEmail(content, {
              attachments: messageEmail.attachments,
              messageEmailId: messageEmail.emailId,
            });

            messageEmail.sendDate = new Date();
            messageEmail.status = "sent";
            await messageEmailRepository.save(messageEmail);
            monitorSuccess();
          } catch (error) {
            appLogger.error("[MessageEmailConsummer] Error sending mail", {
              error,
              sentry: true,
            });
            messageEmail.errorCount++;
            messageEmail.errorMessage = error.message;
            if (messageEmail.errorCount < 5) {
              // retry after 10, 20, 40, 80mn
              messageEmail.nextScheduledDate = addMinutes(
                now,
                5 * Math.pow(2, messageEmail.errorCount)
              );
            } else {
              // permanent fail, won't try anymore
              messageEmail.status = "failed";
            }
            await messageEmailRepository.save(messageEmail);
            const totalErrors = monitorError(error);
            if (totalErrors > 10) {
              appLogger.warn(
                `[MessageEmailConsummer] Too many errors: skip next emails: : ${error}`,
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
}
