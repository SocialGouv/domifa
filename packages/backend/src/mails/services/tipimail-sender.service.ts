import {
  HttpException,
  HttpService,
  HttpStatus,
  Injectable,
} from "@nestjs/common";
import { throwError } from "rxjs";
import { catchError } from "rxjs/operators";
import { domifaConfig } from "../../config";
import { dataEmailAnonymizer } from "../../database";
import { appLogger } from "../../util";

export type TipimailRecipient = { address: string; personalName: string };

export type TipimailMessage = {
  to: TipimailRecipient[];
  from: TipimailRecipient;
  replyTo: TipimailRecipient;
  templateId: string;
  model: { [attr: string]: any };
  subject: string;
};

@Injectable()
export class TipimailSender {
  constructor(private httpService: HttpService) {}

  private _classifyRecipients(recipients: TipimailRecipient[]) {
    const toSkip: TipimailRecipient[] = [];
    const toSend: TipimailRecipient[] = [];
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

  public async sendMail(message: TipimailMessage) {
    const { toSend, toSkip } = this._classifyRecipients(message.to);

    if (toSkip.length !== 0) {
      appLogger.debug(
        `[TipimailSender] [SKIP] Email ${
          message.templateId
        } won't be sent to "${toSkip
          .map((x) => formatEmailAddressWithName(x))
          .join(", ")}"`
      );
    }
    if (domifaConfig().email.emailAddressRedirectAllTo) {
      appLogger.debug(
        `[TipimailSender] [REDIRECT] Email ${
          message.templateId
        } will be sent to "${domifaConfig().email.emailAddressRedirectAllTo}"`
      );
    }

    if (toSend.length === 0) {
      return;
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
        "X-TM-TEMPLATE": message.templateId,
        "X-TM-SUB": [message.model],
      },
      msg: {
        from: message.from,
        replyTo: message.replyTo,
        subject,
        html: `<p>Le template "${message.templateId}" n'existe pas.</p>`, // message par défaut si le templateId n'existe pas
      },
    };

    return this.httpService
      .post("https://api.tipimail.com/v1/messages/send", post, {
        headers: {
          "X-Tipimail-ApiUser": domifaConfig().email.smtp.user,
          "X-Tipimail-ApiKey": domifaConfig().email.smtp.pass,
        },
      })
      .pipe(
        catchError((err) => {
          console.error(
            'Error sending tipimail "${message.templateId}" message:',
            err
          );
          appLogger.warn(
            `Error sending tipimail "${message.templateId}" message`,
            {
              context: err,
              sentryBreadcrumb: true,
            }
          );
          appLogger.error(`Error sending tipimail message`);
          return throwError(
            new HttpException(
              `TIPIMAIL_ERROR_${message.templateId}`,
              HttpStatus.INTERNAL_SERVER_ERROR
            )
          );
        })
      )
      .toPromise();
  }
}
function isRecipientToSkip(recipient: TipimailRecipient) {
  return (
    !domifaConfig().email.emailsEnabled ||
    dataEmailAnonymizer.isAnonymizedEmail(recipient.address) ||
    domifaConfig().email.emailAddressRedirectAllTo
  );
}

function formatEmailAddressWithName(x: TipimailRecipient): string {
  return `"${x.personalName}"<${x.address}>`;
}
