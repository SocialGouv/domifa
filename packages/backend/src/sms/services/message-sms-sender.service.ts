import { Observable, throwError } from "rxjs";
import { HttpService, Injectable } from "@nestjs/common";
import { AxiosError, AxiosResponse } from "axios";
import { catchError, map } from "rxjs/operators";
import { Repository } from "typeorm";
import { domifaConfig } from "../../config";
import { appTypeormManager } from "../../database";
import { MessageSmsTable } from "../../database/entities/message-sms/MessageSmsTable.typeorm";
import { messageSmsRepository } from "../../database/services/message-sms";

import {
  MessageSms,
  MessageSmsSendResponse,
  MESSAGE_SMS_RESPONSE_ERRORS,
} from "../../_common/model/message-sms";

@Injectable()
export class MessageSmsSenderService {
  private messageSmsRepository: Repository<MessageSmsTable>;

  constructor(private httpService: HttpService) {
    this.messageSmsRepository =
      appTypeormManager.getRepository(MessageSmsTable);
  }

  public sendSms(message: MessageSms): Observable<any> {
    const options: {
      key: string;
      message: string;
      destinataires: string;
      expediteur: string;
    } = {
      key: domifaConfig().sms.apiKey,
      message: message.content,
      destinataires:
        domifaConfig().sms.phoneNumberRedirectAllTo || message.phoneNumber,
      expediteur: message.senderName,
    };

    const endPoint =
      "https://www.spot-hit.fr/api/envoyer/sms/?key=" +
      options.key +
      "&message=" +
      encodeURIComponent(options.message) +
      "&destinataires=" +
      options.destinataires +
      "&expediteur=" +
      encodeURIComponent(options.expediteur);

    return this.httpService.get(endPoint).pipe(
      map((response: AxiosResponse) => {
        const responseContent: MessageSmsSendResponse = response.data;
        const updateSms: Partial<MessageSms> = {
          status: "ON_HOLD",
          sendDate: new Date(),
          lastUpdate: new Date(),
        };

        if (responseContent.resultat === 1) {
          updateSms.responseId = responseContent.id;
        } else {
          updateSms.status = "FAILURE";
          updateSms.errorMessage =
            MESSAGE_SMS_RESPONSE_ERRORS[responseContent.erreurs];
          updateSms.errorCount = 1;
        }
        return messageSmsRepository.updateOne(
          { uuid: message.uuid },
          updateSms
        );
      }),
      catchError((err: AxiosError) => {
        return throwError(err);
      })
    );
  }

  public disableAllSmsToSend() {
    return messageSmsRepository.updateMany(
      { status: "TO_SEND" },
      {
        status: "DISABLED",
        sendDate: new Date(),
        lastUpdate: new Date(),
      }
    );
  }
}
