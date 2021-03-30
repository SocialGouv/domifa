import { HttpService, Injectable } from "@nestjs/common";
import { AxiosError, AxiosResponse } from "axios";

import {
  MessageSms,
  MessageSmsSendResponse,
} from "../../_common/model/message-sms";
import { domifaConfig } from "../../config";
import { Repository } from "typeorm";
import { appTypeormManager } from "../../database";
import { MessageSmsTable } from "../../database/entities/message-sms/MessageSmsTable.typeorm";
import { messageSmsRepository } from "../../database/services/message-sms";
import { appLogger } from "../../util";
@Injectable()
export class MessageSmsSenderService {
  private messageSmsRepository: Repository<MessageSmsTable>;

  constructor(private httpService: HttpService) {
    this.messageSmsRepository = appTypeormManager.getRepository(
      MessageSmsTable
    );
  }

  public async sendSms(message: MessageSms) {
    const options: {
      key: string;
      message: string;
      destinataires: string;
      expediteur: string;
    } = {
      key: domifaConfig().sms.apiKey,
      message: message.content,
      destinataires: message.phoneNumber + "IAJA",
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

    return this.httpService.get(endPoint).subscribe(
      (response: AxiosResponse) => {
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
          updateSms.errorMessage = responseContent.erreurs.toString();
        }

        messageSmsRepository.updateOne({ uuid: message.uuid }, updateSms);
      },
      (error: AxiosError) => {
        appLogger.error(`[SmsSender] Error running application`, {
          error,
          sentry: true,
        });
      }
    );
  }
}
