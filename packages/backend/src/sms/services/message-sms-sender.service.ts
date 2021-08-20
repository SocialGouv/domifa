import { Injectable } from "@nestjs/common";
import { HttpService } from "@nestjs/axios";

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
import { AxiosError } from "axios";

@Injectable()
export class MessageSmsSenderService {
  private messageSmsRepository: Repository<MessageSmsTable>;

  constructor(private httpService: HttpService) {
    this.messageSmsRepository =
      appTypeormManager.getRepository(MessageSmsTable);
  }

  public async sendSms(message: MessageSms): Promise<MessageSms> {
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

    const updateSms: Partial<MessageSms> = {
      lastUpdate: new Date(),
      errorCount: message.errorCount,
    };

    try {
      const response = await this.httpService.get(endPoint).toPromise();
      const responseContent: MessageSmsSendResponse = response.data;

      if (responseContent.resultat === 1) {
        updateSms.responseId = responseContent.id;
        updateSms.status = "ON_HOLD";
        updateSms.sendDate = new Date();
      } else {
        updateSms.status = "FAILURE";
        updateSms.errorCount++;
        updateSms.errorMessage =
          MESSAGE_SMS_RESPONSE_ERRORS[responseContent.erreurs];
      }
    } catch (err) {
      updateSms.status = "FAILURE";
      updateSms.errorCount++;
      updateSms.errorMessage = (err as AxiosError)?.message;
    }

    const messageSms = await messageSmsRepository.updateOne(
      { uuid: message.uuid },
      updateSms
    );

    if (updateSms.status === "FAILURE") {
      throw new Error(`Sms error: ${updateSms.errorMessage}`);
    }

    return messageSms;
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
