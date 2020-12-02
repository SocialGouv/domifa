import { Injectable } from "@nestjs/common";
import { Cron } from "@nestjs/schedule";
import { from, ReplaySubject } from "rxjs";
import { concatMap, debounceTime } from "rxjs/operators";
import { LessThanOrEqual } from "typeorm";
import { domifaConfig } from "../../config";
import {
  MessageEmail,
  messageEmailRepository,
  typeOrmSearch,
} from "../../database";
import { appLogger } from "../../util";
import { TipimailSender } from "./tipimail-sender.service";
import moment = require("moment");

@Injectable()
export class MessageEmailConsummer {
  private trigger$ = new ReplaySubject<boolean>(1);

  constructor(private tipimailSender: TipimailSender) {
    this.trigger$
      .pipe(
        debounceTime(1000),
        concatMap(() => from(this.consumeNextEmails()))
      )
      .subscribe();
  }

  public triggerNextSending() {
    this.trigger$.next(true);
  }
  @Cron(domifaConfig().cron.emailConsumer.crontime)
  protected async sendMailImportCron() {
    if (!domifaConfig().cron.enable) {
      return;
    }
    this.trigger$.next(true);
  }

  private async consumeNextEmails() {
    const now = new Date();
    const messageEmails = await messageEmailRepository.findMany(
      typeOrmSearch<MessageEmail>({
        status: "pending",
        nextScheduledDate: LessThanOrEqual(now),
      })
    );
    for (const messageEmail of messageEmails) {
      try {
        messageEmail.sendDetails = await this.tipimailSender.trySendToTipimail(
          messageEmail.content
        );
        messageEmail.sendDate = new Date();
        messageEmail.status = "sent";
        await messageEmailRepository.save(messageEmail);
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
      }
    }
  }
}
