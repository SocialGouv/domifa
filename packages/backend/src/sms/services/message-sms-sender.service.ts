import { Injectable } from "@nestjs/common";
import { HttpService } from "@nestjs/axios";

import { domifaConfig } from "../../config";
import { messageSmsRepository } from "../../database/services/message-sms";
import {
  MessageSmsSendResponse,
  MESSAGE_SMS_RESPONSE_ERRORS,
} from "../../_common/model/message-sms";
import { AxiosError } from "@nestjs/terminus/dist/errors/axios.error";
import { MessageSms } from "@domifa/common";

@Injectable()
export class MessageSmsSenderService {
  constructor(private httpService: HttpService) {}

  public async sendSms(message: {
    content: string;
    phoneNumber: string;
    senderName: string;
    structureId: number;
    uuid: string;
    errorCount: number;
  }): Promise<MessageSms> {
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

    const url =
      "https://europe.ipx.com/restapi/v1/sms/send?destinationAddress=" +
      options.destinataires +
      "&messageText=" +
      encodeURIComponent(options.message) +
      "&originatingAddress=" +
      encodeURIComponent(options.expediteur) +
      "&originatorTON=1";

    const headers = {
      Authorization: "Basic " + domifaConfig().sms.apiKey,
    };

    const updateSms: Partial<MessageSms> = {
      lastUpdate: new Date(),
      errorCount: message.errorCount,
    };

    try {
      const response = await this.httpService.axiosRef.get(url, {
        headers: headers,
      });

      const responseContent: MessageSmsSendResponse = response.data;

      if (responseContent.responseCode === 0) {
        updateSms.responseId = responseContent.messageIds[0];
        updateSms.status = "ON_HOLD";
        updateSms.sendDate = new Date();
      } else {
        updateSms.status = "FAILURE";
        updateSms.errorCount++;
        updateSms.errorMessage =
          MESSAGE_SMS_RESPONSE_ERRORS[responseContent.responseCode];
      }
    } catch (err) {
      updateSms.status = "FAILURE";
      updateSms.errorCount++;
      updateSms.errorMessage = (err as AxiosError)?.message;
    }

    await messageSmsRepository.update({ uuid: message.uuid }, updateSms);

    const messageSms = await messageSmsRepository.findOneBy({
      uuid: message.uuid,
    });

    if (updateSms.status === "FAILURE") {
      throw new Error(`Sms error: ${updateSms.errorMessage}`);
    }
    return messageSms;
  }
}
