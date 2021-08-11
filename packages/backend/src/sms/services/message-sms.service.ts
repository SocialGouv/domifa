import { MessageSmsSuivi } from "./../../_common/model/message-sms/MessageSmsSuivi.type";
import moment = require("moment");
import { HttpService, Injectable } from "@nestjs/common";
import { Repository, ReturningStatementNotSupportedError } from "typeorm";
import { appTypeormManager, structureRepository } from "../../database";
import { MessageSmsTable } from "../../database/entities/message-sms/MessageSmsTable.typeorm";
import { messageSmsRepository } from "../../database/services/message-sms";
import { InteractionDto } from "../../interactions/interactions.dto";
import { appLogger } from "../../util";
import { Structure, Usager, UsagerLight } from "../../_common/model";
import { MessageSms } from "../../_common/model/message-sms";
import { StructureSmsParams } from "../../_common/model/structure/StructureSmsParams.type";
import { generateSmsInteraction } from "./generators";

import { AxiosError } from "axios";
import { domifaConfig } from "../../config";

@Injectable()
export class MessageSmsService {
  // Délai entre chaque message envoyé
  private messageSmsRepository: Repository<MessageSmsTable>;

  public constructor(private httpService: HttpService) {
    this.messageSmsRepository =
      appTypeormManager.getRepository(MessageSmsTable);
  }

  public async updateMessageSmsStatut(smsToUpdate: MessageSms) {
    //
    const options: {
      key: string;
      id: string;
    } = {
      key: domifaConfig().sms.apiKey,
      id: smsToUpdate.responseId,
    };

    const endPoint =
      "https://www.spot-hit.fr/api/envoyer/sms/?key=" +
      options.key +
      "&id=" +
      encodeURIComponent(options.id);

    try {
      const response = await this.httpService.get(endPoint).toPromise();
      const responseContent: MessageSmsSuivi = response.data;
      console.log(responseContent);
    } catch (err) {
      smsToUpdate.status = "FAILURE";
      smsToUpdate.errorCount++;
      smsToUpdate.errorMessage = (err as AxiosError)?.message;
    }

    const messageSms = await messageSmsRepository.updateOne(
      { uuid: smsToUpdate.uuid },
      smsToUpdate
    );

    if (smsToUpdate.status === "FAILURE") {
      throw new Error(`Sms error: ${smsToUpdate.errorMessage}`);
    }

    return messageSms;
  }

  // Suppression d'un SMS si le courrier a été distribué
  public async deleteSmsInteractionOut(
    usager: Pick<Usager, "ref" | "preference">,
    structureId: number,
    interaction: InteractionDto
  ) {
    const smsOnHold = await messageSmsRepository.findSmsOnHold({
      usagerRef: usager.ref,
      structureId,
      interactionType: interaction.type,
    });

    if (smsOnHold) {
      return messageSmsRepository.deleteByCriteria({ uuid: smsOnHold.uuid });
    } else if (usager.preference?.phone === true) {
      appLogger.warn(`SMS Service: Interaction Out not found`);
    }
  }

  // Suppression d'un SMS si l'interaction a été supprimée
  public async deleteSmsInteraction(
    usager: Pick<Usager, "ref" | "preference">,
    structureId: number,
    interaction: InteractionDto
  ) {
    const smsOnHold = await messageSmsRepository.findSmsOnHold({
      usagerRef: usager.ref,
      structureId,
      interactionType: interaction.type,
    });

    if (smsOnHold) {
      smsOnHold.interactionMetas.nbCourrier =
        smsOnHold.interactionMetas.nbCourrier - interaction.nbCourrier;

      if (smsOnHold.interactionMetas.nbCourrier > 0) {
        return messageSmsRepository.updateOne(
          { uuid: smsOnHold.uuid },
          { interactionMetas: smsOnHold.interactionMetas }
        );
      } else {
        return messageSmsRepository.deleteByCriteria({ uuid: smsOnHold.uuid });
      }
    } else if (usager.preference?.phone === true) {
      appLogger.warn(`SMS Service: Interaction to delete not found`);
    }
  }

  public async createSmsInteraction(
    usager: UsagerLight,
    structure: Pick<Structure, "id" | "sms">,
    interaction: InteractionDto
  ) {
    let scheduledDate = moment()
      .set({
        hour: 19,
        minute: 0,
        second: 0,
        millisecond: 0,
      })
      .toDate();

    if (new Date() > scheduledDate) {
      scheduledDate = moment()
        .add(1, "day")
        .set({
          hour: 19,
          minute: 0,
          second: 0,
          millisecond: 0,
        })
        .toDate();
    }

    const smsReady: MessageSms = await messageSmsRepository.findSmsOnHold({
      usagerRef: usager.ref,
      structureId: structure.id,
      interactionType: interaction.type,
    });

    if (smsReady) {
      smsReady.interactionMetas.nbCourrier =
        smsReady.interactionMetas.nbCourrier + interaction.nbCourrier;
      const content = generateSmsInteraction(
        interaction,
        structure.sms.senderDetails
      );

      smsReady.interactionMetas.date = new Date();

      return messageSmsRepository.updateOne(
        { uuid: smsReady.uuid },
        { content, interactionMetas: smsReady.interactionMetas }
      );
    } else {
      const content = generateSmsInteraction(
        interaction,
        structure.sms.senderDetails
      );

      const createdSms: MessageSms = {
        // Infos sur l'usager
        usagerRef: usager.ref,
        structureId: structure.id,
        content,
        senderName: structure.sms.senderName,
        status: "TO_SEND",
        smsId: interaction.type,
        phoneNumber: usager.preference.phoneNumber,
        scheduledDate,
        interactionMetas: {
          nbCourrier: interaction.nbCourrier,
          date: new Date(),
          interactionType: interaction.type,
        },
      };

      return messageSmsRepository.save(createdSms);
    }
  }

  // Afficher les SMS en attente d'envoi
  public findAll(usager: UsagerLight): Promise<MessageSmsTable[]> {
    return this.messageSmsRepository.find({
      where: { structureId: usager.structureId, usagerRef: usager.ref },
      order: {
        createdAt: "DESC",
      },
      skip: 0,
      take: 10,
    });
  }

  // Mise à jour par DOMIFA de l'autorisation d'envoi de SMS
  public changeStatutByDomifa(structureId: number, sms: StructureSmsParams) {
    return structureRepository.updateOne({ id: structureId }, { sms });
  }
}
