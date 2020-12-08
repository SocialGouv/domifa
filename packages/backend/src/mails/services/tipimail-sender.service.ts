import {
  HttpException,
  HttpService,
  HttpStatus,
  Injectable,
} from "@nestjs/common";
import { AxiosResponse } from "axios";
import { of, throwError } from "rxjs";
import { catchError, switchMap } from "rxjs/operators";
import { domifaConfig } from "../../config";
import {
  dataEmailAnonymizer,
  MessageEmailContent,
  MessageEmailRecipient,
  MessageEmailSendDetails,
} from "../../database";
import { appLogger } from "../../util";

@Injectable()
export class TipimailSender {
  constructor(private httpService: HttpService) {}

  private _classifyRecipients(recipients: MessageEmailRecipient[]) {
    const toSkip: MessageEmailRecipient[] = [];
    const toSend: MessageEmailRecipient[] = [];
    if (domifaConfig().email.emailAddressRedirectAllTo) {
      toSend.push({
        address: domifaConfig().email.emailAddressRedirectAllTo,
        personalName: `TEST DOMIFA`,
      });
    }
    recipients.forEach((recipient) => {
      if (isRecipientToSkip(recipient)) {
        toSkip.push(recipient);
      } else {
        toSend.push(recipient);
      }
    });
    return { toSend, toSkip };
  }

  public async trySendToTipimail(
    message: MessageEmailContent & {
      attachments?: [
        {
          contentType: string;
          filename: string;
          content: any;
        }
      ];
    }
  ): Promise<MessageEmailSendDetails> {
    const { toSend, toSkip } = this._classifyRecipients(message.to);

    if (toSkip.length !== 0) {
      appLogger.debug(
        `[TipimailSender] [SKIP] Email ${
          message.tipimailTemplateId
        } won't be sent to "${toSkip
          .map((x) => formatEmailAddressWithName(x))
          .join(", ")}"`
      );
    }
    if (!domifaConfig().email.emailsEnabled) {
      return {
        sent: [],
        skipped: toSkip,
        serverResponse: "email sending disabled",
        modelsCount: message.tipimailModels.length,
      };
    }
    if (domifaConfig().email.emailAddressRedirectAllTo) {
      appLogger.debug(
        `[TipimailSender] [REDIRECT] Email ${
          message.tipimailTemplateId
        } will be sent to "${domifaConfig().email.emailAddressRedirectAllTo}"`
      );
    }

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

    if (domifaConfig().email.emailAddressRedirectAllTo) {
      subject += ` (redirect from ${toSkip
        .map((x) => formatEmailAddressWithName(x))
        .join(", ")})`;
    }

    return this._postTipimailMessage({ toSend, message, subject, toSkip });
  }
  private _postTipimailMessage({
    toSend,
    message,
    subject,
    toSkip,
  }: {
    toSend: MessageEmailRecipient[];
    message: MessageEmailContent & {
      attachments?: [
        {
          contentType: string;
          filename: string;
          content: any;
        }
      ];
    };
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
        attachments: message.attachments,
        html: `<p>Le template "${message.tipimailTemplateId}" n'existe pas.</p>`,
      },
    };

    // https://docs.tipimail.com/fr/integrate/api/messages
    return this.httpService
      .post("https://api.tipimail.com/v1/messages/send", post, {
        headers: {
          "X-Tipimail-ApiUser": domifaConfig().email.smtp.user,
          "X-Tipimail-ApiKey": domifaConfig().email.smtp.pass,
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

function isRecipientToSkip(recipient: MessageEmailRecipient) {
  return (
    !domifaConfig().email.emailsEnabled ||
    dataEmailAnonymizer.isAnonymizedEmail(recipient.address) ||
    domifaConfig().email.emailAddressRedirectAllTo
  );
}

function formatEmailAddressWithName(x: MessageEmailRecipient): string {
  return `"${x.personalName}"<${x.address}>`;
}
