import { pgRepository } from "./../_postgres/pgRepository.service";

import { In } from "typeorm";

import { myDataSource, typeOrmSearch } from "..";

import { MessageSms, InteractionType } from "../../../_common/model";
import { MessageSmsTable } from "./../../entities/message-sms/MessageSmsTable.typeorm";

const baseRepository = pgRepository.get<MessageSmsTable, MessageSms>(
  MessageSmsTable
);

export const messageSmsRepository = myDataSource
  .getRepository<MessageSms>(MessageSmsTable)
  .extend({
    findOneWithQuery: baseRepository.findOneWithQuery,
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
  return messageSmsRepository
    .createQueryBuilder("interactions")
    .where(
      `"interactionMetas"->>'interactionType' = :interactionType and status='TO_SEND' and "usagerRef"= :usagerRef and "structureId"=:structureId `,
      {
        usagerRef,
        structureId,
        interactionType,
      }
    )
    .getOne();
}

async function findInteractionSmsToSend(
  structureIds: number[]
): Promise<MessageSms[]> {
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
    return messageSmsRepository.save(sms);
  }

  return message;
}

async function findSmsEndDomToSend(
  structureIds: number[]
): Promise<MessageSms[]> {
  return messageSmsRepository.findBy(
    typeOrmSearch<MessageSmsTable>({
      smsId: "echeanceDeuxMois",
      structureId: In(structureIds),
      status: "TO_SEND",
    })
  );
}
