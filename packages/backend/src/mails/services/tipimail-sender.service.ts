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
    recipients.forEach((recipient) => {
      if (
        !domifaConfig().email.emailsEnabled ||
        dataEmailAnonymizer.isAnonymizedEmail(recipient.address)
      ) {
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
        } won't be send to ${toSkip
          .map((x) => `"${x.personalName}"<${x.address}>`)
          .join(", ")}`
      );
      return;
    }

    if (toSend.length === 0) {
      return;
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
        subject: message.subject,
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
