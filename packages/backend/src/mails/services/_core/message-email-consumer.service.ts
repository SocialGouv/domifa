import { Injectable } from "@nestjs/common";
import { Cron } from "@nestjs/schedule";
import { from } from "rxjs";
import { concatMap, debounceTime } from "rxjs/operators";
import { LessThanOrEqual } from "typeorm";
import { domifaConfig } from "../../../config";
import {
  MessageEmail,
  MessageEmailContent,
  messageEmailRepository,
  monitoringBatchProcessSimpleCountRunner,
  MonitoringBatchProcessTrigger,
  typeOrmSearch,
} from "../../../database";
import { appLogger } from "../../../util";
import { messageEmailConsummerTrigger } from "./message-email-consumer-trigger.service";
import { smtpSender } from "./smtpSender.service";
import moment = require("moment");
import { isCronEnabled } from "../../../config/services/isCronEnabled.service";

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
      appLogger.warn(`[CRON] [consumeEmailsCron] Disabled by config`);
      return;
    }

    messageEmailConsummerTrigger.triggerNextSending("cron");
  }

  protected async consumeEmails(trigger: MonitoringBatchProcessTrigger) {
    await monitoringBatchProcessSimpleCountRunner.monitorProcess(
      {
        processId: "mail-messages-consumer",
        trigger,
      },
      async ({ monitorTotal, monitorSuccess, monitorError }) => {
        const now = new Date();
        const messageEmails = await messageEmailRepository.findMany(
          typeOrmSearch<MessageEmail>({
            status: "pending",
            nextScheduledDate: LessThanOrEqual(now),
          })
        );
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
          } catch (err) {
            const error: Error = err as Error;

            appLogger.error("[MessageEmailConsummer] Error sending mail", {
              error,
              sentry: true,
            });
            messageEmail.errorCount++;
            messageEmail.errorMessage = (err as Error).message;
            if (messageEmail.errorCount < 5) {
              messageEmail.nextScheduledDate = moment(now)
                // retry after 10, 20, 40, 80mn
                .add(5 * Math.pow(2, messageEmail.errorCount), "minutes")
                .toDate();
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
                  sentryBreadcrumb: true,
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
