import { Injectable } from "@nestjs/common";
import { Cron } from "@nestjs/schedule";
import { from, ReplaySubject } from "rxjs";
import { concatMap, debounceTime } from "rxjs/operators";
import { LessThanOrEqual } from "typeorm";
import { domifaConfig } from "../../config";
import {
  MessageEmail,
  messageEmailRepository,
  monitoringBatchProcessSimpleCountRunner,
  MonitoringBatchProcessTrigger,
  typeOrmSearch,
} from "../../database";
import { appLogger } from "../../util";
import { TipimailSender } from "./tipimail-sender.service";
import moment = require("moment");

@Injectable()
export class MessageEmailConsummer {
  private trigger$ = new ReplaySubject<MonitoringBatchProcessTrigger>(1);

  constructor(private tipimailSender: TipimailSender) {
    this.trigger$
      .pipe(
        debounceTime(1000),
        concatMap((trigger) => from(this.consumeEmails(trigger)))
      )
      .subscribe();
  }

  public triggerNextSending(trigger: MonitoringBatchProcessTrigger = "app") {
    this.trigger$.next(trigger);
  }

  @Cron(domifaConfig().cron.emailConsumer.crontime)
  protected async consumeEmailsCron() {
    if (!domifaConfig().cron.enable) {
      return;
    }
    this.trigger$.next("cron");
  }

  public async consumeEmails(trigger: MonitoringBatchProcessTrigger) {
    monitoringBatchProcessSimpleCountRunner.monitorProcess(
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
            messageEmail.sendDetails = await this.tipimailSender.trySendToTipimail(
              messageEmail.content
            );
            messageEmail.sendDate = new Date();
            messageEmail.status = "sent";
            await messageEmailRepository.save(messageEmail);
            monitorSuccess();
          } catch (err) {
            appLogger.error("[MessageEmailConsummer] Error sending mail", {
              error: err,
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
            const totalErrors = monitorError(err);
            if (totalErrors > 10) {
              appLogger.warn(
                `[MessageEmailConsummer] Too many errors: skip next emails: : ${err.message}`,
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
