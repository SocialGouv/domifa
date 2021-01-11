import {
  HttpException,
  HttpService,
  HttpStatus,
  Injectable,
} from "@nestjs/common";
import { AxiosResponse } from "axios";
import { of, throwError } from "rxjs";
import { catchError, switchMap } from "rxjs/operators";
import { domifaConfig } from "../../../config";
import {
  MessageEmailAttachement,
  MessageEmailId,
  MessageEmailRecipient,
  MessageEmailSendDetails,
  MessageEmailTipimailContent,
} from "../../../database";
import { appLogger } from "../../../util";
import { mailRecipientsFilter } from "./mailRecipientsFilter.service";

@Injectable()
export class TipimailSender {
  constructor(private httpService: HttpService) {}

  public async trySendToTipimail(
    message: Omit<MessageEmailTipimailContent, "attachments">,
    {
      messageEmailId,
      attachments,
    }: {
      messageEmailId: MessageEmailId;
      attachments?: MessageEmailAttachement[];
    }
  ): Promise<MessageEmailSendDetails> {
    const { toSend, toSkip } = mailRecipientsFilter.filterRecipients(
      message.to,
      { messageEmailId }
    );

    if (toSend.length === 0) {
      return {
        sent: toSend,
        skipped: toSkip,
        serverResponse: "all recipients skipped",
        modelsCount: message.tipimailModels.length,
      };
    }

    let subject = message.subject;

    if (domifaConfig().envId !== "prod") {
      subject = `[${domifaConfig().envId}] ${subject}`;
    }

    return this._postTipimailMessage({
      toSend,
      message,
      attachments,
      subject,
      toSkip,
    });
  }
  private _postTipimailMessage({
    toSend,
    message,
    attachments,
    subject,
    toSkip,
  }: {
    toSend: MessageEmailRecipient[];
    message: Omit<MessageEmailTipimailContent, "attachments">;
    attachments?: MessageEmailAttachement[];
    subject: string;
    toSkip: MessageEmailRecipient[];
  }): Promise<MessageEmailSendDetails> {
    const post = {
      to: toSend,
      headers: {
        "X-TM-TEMPLATE": message.tipimailTemplateId,
        "X-TM-SUB": message.tipimailModels,
      },
      msg: {
        from: message.from,
        replyTo: message.replyTo,
        subject,
        attachments: attachments,
        html: `<p>Le template "${message.tipimailTemplateId}" n'existe pas.</p>`,
      },
    };

    // https://docs.tipimail.com/fr/integrate/api/messages
    return this.httpService
      .post("https://api.tipimail.com/v1/messages/send", post, {
        headers: {
          "X-Tipimail-ApiUser": domifaConfig().email.tipimailApi.user,
          "X-Tipimail-ApiKey": domifaConfig().email.tipimailApi.pass,
        },
      })
      .pipe(
        switchMap((result: AxiosResponse) => {
          if (result.status !== 200) {
            // https://docs.tipimail.com/fr/integrate/api
            appLogger.warn(JSON.stringify(result.data));
            appLogger.warn(
              `Error status "${result.status}" sending tipimail "${message.tipimailTemplateId}" message`,
              {
                sentryBreadcrumb: true,
              }
            );
            return throwError(
              new HttpException(
                `TIPIMAIL_ERROR_${message.tipimailTemplateId}`,
                HttpStatus.INTERNAL_SERVER_ERROR
              )
            );
          } else {
            // SUCCESS
            const sendDetails: MessageEmailSendDetails = {
              sent: toSend,
              skipped: toSkip,
              serverResponse: result.data,
              modelsCount: message.tipimailModels.length,
            };
            return of(sendDetails);
          }
        }),
        catchError((err) => {
          appLogger.warn(
            `Error sending tipimail "${message.tipimailTemplateId}" message: : ${err.message}`,
            {
              sentryBreadcrumb: true,
            }
          );
          appLogger.error(`[TipimailSender] Error sending tipimail message`);
          return throwError(
            new HttpException(
              `TIPIMAIL_ERROR_${message.tipimailTemplateId}`,
              HttpStatus.INTERNAL_SERVER_ERROR
            )
          );
        })
      )
      .toPromise();
  }
}
