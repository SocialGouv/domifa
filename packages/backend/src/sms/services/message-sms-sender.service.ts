import { StructureLight } from "../../_common/model/structure/StructureLight.type";
import { HttpService, Injectable } from "@nestjs/common";
import { AxiosError, AxiosResponse } from "axios";

import {
  MessageSms,
  MessageSmsSendResponse,
} from "../../_common/model/message-sms";
import { domifaConfig } from "../../config";
@Injectable()
export class MessageSmsSenderService {
  constructor(private httpService: HttpService) {}

  public async sendSms(message: MessageSms) {
    // 1. Get On Hold SMS < NOW
    // 2. Parcours des sms
    // 3. Envoi
    // 4. Catch de la réponse

    const options: {
      key: string;
      message: string;
      destinataires: string;
      expediteur: string;
    } = {
      key: domifaConfig().sms.apiKey,
      message: message.content,
      destinataires: message.phoneNumber,
      expediteur: message.senderName,
    };

    const endPoint =
      "https://www.spot-hit.fr/api/envoyer/sms/?key=" +
      options.key +
      "&message=" +
      options.message +
      "&destinataires=" +
      options.destinataires +
      "&expediteur=" +
      options.expediteur;

    return this.httpService.get(endPoint).subscribe(
      (response: AxiosResponse<MessageSmsSendResponse[]>) => {
        console.log(response);
      },
      (error: AxiosError) => {
        console.log(error);
      }
    );
  }

  private async _findUsersToSendImportGuide(): Promise<MessageSms[]> {
    return [];
  }
}
