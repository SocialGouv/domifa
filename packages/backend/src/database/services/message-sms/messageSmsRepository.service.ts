import { In } from "typeorm";

import { myDataSource, typeOrmSearch } from "..";
import { appLogger } from "../../../util";
import { MessageSms, InteractionType } from "../../../_common/model";
import { MessageSmsTable } from "./../../entities/message-sms/MessageSmsTable.typeorm";

export const messageSmsRepository = myDataSource
  .getRepository(MessageSmsTable)
  .extend({
    findSmsOnHold,
    findInteractionSmsToSend,
    upsertEndDom,
    findSmsEndDomToSend,
  });

async function findSmsOnHold({
  usagerRef,
  structureId,
  interactionType,
}: {
  usagerRef: number;
  structureId: number;
  interactionType: InteractionType;
}): Promise<MessageSms> {
  // TODO: check
  return messageSmsRepository.query(
    `"interactionMetas"->>'interactionType' = :interactionType and
    status='TO_SEND' and
    "usagerRef"= :usagerRef and
    "structureId"=:structureId `,
    [usagerRef, structureId, interactionType]
  );
}

async function findInteractionSmsToSend(
  structureIds: number[]
): Promise<MessageSmsTable[]> {
  return messageSmsRepository.findBy(
    typeOrmSearch<MessageSmsTable>({
      status: "TO_SEND",
      structureId: In(structureIds),
      smsId: In(["courrierIn", "recommandeIn", "colisIn"]),
    })
  );
}

async function upsertEndDom(sms: MessageSms): Promise<MessageSms> {
  const message = await messageSmsRepository.findOneBy({
    smsId: "echeanceDeuxMois",
    usagerRef: sms.usagerRef,
    structureId: sms.structureId,
    status: "TO_SEND",
  });

  if (!message) {
    return await messageSmsRepository.save(sms);
  }

  appLogger.warn("SMS Already exists");

  return message;
}

async function findSmsEndDomToSend(
  structureIds: number[]
): Promise<MessageSmsTable[]> {
  return messageSmsRepository.findBy(
    typeOrmSearch<MessageSmsTable>({
      smsId: "echeanceDeuxMois",
      structureId: In(structureIds),
      status: "TO_SEND",
    })
  );
}
