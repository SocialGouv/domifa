import {
  InteractionType,
  MessageSms,
  MessageSmsReminders,
} from "../../../_common/model";
import { MessageSmsTable } from "../../entities/message-sms/MessageSmsTable.typeorm";
import { pgRepository } from "../_postgres";

const baseRepository = pgRepository.get<MessageSmsTable, MessageSms>(
  MessageSmsTable
);

export const SMS_ON_HOLD_INTERACTION: (keyof MessageSms)[] = [
  "uuid",
  "usagerRef",
  "structureId",
  "content",
  "smsId",
  "status",
  "scheduledDate",
  "sendDate",
  "interactionMetas",
  "lastUpdate",
  "responseId",
  "phoneNumber",
  "senderName",
  "statusUpdates",
];

export const messageSmsRepository = {
  ...baseRepository,
  findSmsOnHold,
  findSmsToSend,
  upsertEndDom,
  findSmsEndDomToSend,
};

async function findSmsOnHold({
  usagerRef,
  structureId,
  interactionType,
}: {
  usagerRef: number;
  structureId: number;
  interactionType: InteractionType;
}): Promise<MessageSms> {
  return messageSmsRepository.findOneWithQuery<MessageSms>({
    select: SMS_ON_HOLD_INTERACTION,
    where: `"interactionMetas"->>'interactionType' = :interactionType and
    status='TO_SEND' and
    "usagerRef"= :usagerRef and
    "structureId"=:structureId `,
    params: {
      usagerRef,
      structureId,
      interactionType,
    },
  });
}

async function findSmsToSend(): Promise<MessageSmsTable[]> {
  return messageSmsRepository.findMany({
    status: "TO_SEND",
  });
}

async function upsertEndDom(sms: MessageSms): Promise<MessageSms> {
  const message = await messageSmsRepository.findOneWithQuery<MessageSms>({
    select: SMS_ON_HOLD_INTERACTION,
    where: `"usagerRef" = :usagerRef
    and "structureId" = :structureId
    and "smsId" = 'echeanceDeuxMois'`,
    params: { usagerRef: sms.usagerRef, structureId: sms.structureId },
  });

  if (!message) {
    return await messageSmsRepository.save(sms);
  }

  return message;
}

async function findSmsEndDomToSend(): Promise<MessageSmsTable[]> {
  return messageSmsRepository.findMany({
    smsId: "echeanceDeuxMois",
    status: "TO_SEND",
  });
}
