import {
  HttpException,
  HttpService,
  HttpStatus,
  Injectable,
} from "@nestjs/common";
import { throwError } from "rxjs";
import { catchError } from "rxjs/operators";
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
    message: MessageEmailContent
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
      return { sent: [], skipped: toSkip };
    }
    if (domifaConfig().email.emailAddressRedirectAllTo) {
      appLogger.debug(
        `[TipimailSender] [REDIRECT] Email ${
          message.tipimailTemplateId
        } will be sent to "${domifaConfig().email.emailAddressRedirectAllTo}"`
      );
    }

    if (toSend.length === 0) {
      return { sent: toSend, skipped: toSkip };
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

    const post = {
      to: toSend,
      headers: {
        "X-TM-TEMPLATE": message.tipimailTemplateId,
        "X-TM-SUB": [message.tipimailModel],
      },
      msg: {
        from: message.from,
        replyTo: message.replyTo,
        subject,
        html: `<p>Le template "${message.tipimailTemplateId}" n'existe pas.</p>`, // message par défaut si le tipimailTemplateId n'existe pas
      },
    };

    await this.httpService
      .post("https://api.tipimail.com/v1/messages/send", post, {
        headers: {
          "X-Tipimail-ApiUser": domifaConfig().email.smtp.user,
          "X-Tipimail-ApiKey": domifaConfig().email.smtp.pass,
        },
      })
      .pipe(
        catchError((err) => {
          appLogger.warn(
            `Error sending tipimail "${message.tipimailTemplateId}" message: : ${err.message}`,
            {
              sentryBreadcrumb: true,
            }
          );
          appLogger.error(`Error sending tipimail message`);
          return throwError(
            new HttpException(
              `TIPIMAIL_ERROR_${message.tipimailTemplateId}`,
              HttpStatus.INTERNAL_SERVER_ERROR
            )
          );
        })
      )
      .toPromise();

    return { sent: toSend, skipped: toSkip };
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
