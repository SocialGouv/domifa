import { In } from "typeorm";

import { appTypeormManager } from "../_postgres";
import { pgRepository, typeOrmSearch } from "..";
import { appLogger } from "../../../util";
import {
  MessageSms,
  InteractionType,
  MessageSmsId,
} from "../../../_common/model";
import { MessageSmsTable } from "./../../entities/message-sms/MessageSmsTable.typeorm";

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
  findInteractionSmsToSend,
  upsertEndDom,
  findSmsEndDomToSend,
  statsSmsGlobal,
  statsSmsByDays,
  statsSmsByMonths,
  getFirstSmsByStructure,
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

async function findInteractionSmsToSend(): Promise<MessageSmsTable[]> {
  return messageSmsRepository.findMany(
    typeOrmSearch<MessageSmsTable>({
      status: "TO_SEND",
      smsId: In(["courrierIn", "recommandeIn", "colisIn"]),
    })
  );
}

async function upsertEndDom(sms: MessageSms): Promise<MessageSms> {
  const message = await messageSmsRepository.findOne<MessageSms>({
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

async function findSmsEndDomToSend(): Promise<MessageSmsTable[]> {
  return messageSmsRepository.findMany({
    smsId: "echeanceDeuxMois",
    status: "TO_SEND",
  });
}

async function statsSmsGlobal() {
  const query = `SELECT date_trunc('month', CAST("public"."message_sms"."sendDate" AS timestamp)) AS "sendDate", count(*) AS "count"
                 FROM "public"."message_sms"
                 WHERE ("public"."message_sms"."sendDate" >= date_trunc('month', CAST((CAST(now() AS timestamp) + (INTERVAL '-12 month')) AS timestamp))
                 AND "public"."message_sms"."sendDate" < date_trunc('month', CAST(now() AS timestamp)))
                 GROUP BY date_trunc('month', CAST("public"."message_sms"."sendDate" AS timestamp))
                 ORDER BY date_trunc('month', CAST("public"."message_sms"."sendDate" AS timestamp)) ASC`;

  return appTypeormManager.getRepository(MessageSmsTable).query(query);
}

async function statsSmsByDays(messageSmsId: MessageSmsId) {
  const query = `SELECT CAST("public"."message_sms"."sendDate" AS date) AS "sendDate", count(*) AS "count"
                 FROM "public"."message_sms"
                 WHERE ("public"."message_sms"."smsId" = '${messageSmsId}'
                 AND "public"."message_sms"."sendDate" >= CAST((CAST(now() AS timestamp) + (INTERVAL '-30 day')) AS date) AND "public"."message_sms"."sendDate" < CAST(now() AS date))
                 GROUP BY CAST("public"."message_sms"."sendDate" AS date)
                 ORDER BY CAST("public"."message_sms"."sendDate" AS date) ASC`;

  return appTypeormManager.getRepository(MessageSmsTable).query(query);
}

async function statsSmsByMonths(messageSmsId: MessageSmsId) {
  const query = `SELECT date_trunc('month', CAST("public"."message_sms"."sendDate" AS timestamp)) AS "sendDate", count(*) AS "count"
                 FROM "public"."message_sms"
                 WHERE ("public"."message_sms"."smsId" = '${messageSmsId}'
                 AND "public"."message_sms"."sendDate" >= date_trunc('month', CAST((CAST(now() AS timestamp) + (INTERVAL '-12 month')) AS timestamp)) AND "public"."message_sms"."sendDate" < date_trunc('month', CAST(now() AS timestamp)))
                 GROUP BY date_trunc('month', CAST("public"."message_sms"."sendDate" AS timestamp))
                 ORDER BY date_trunc('month', CAST("public"."message_sms"."sendDate" AS timestamp)) ASC`;

  return appTypeormManager.getRepository(MessageSmsTable).query(query);
}

async function getFirstSmsByStructure(structureId: number) {
  const query = `SELECT "structureId", "createdAt"
                 FROM "message_sms"
                 WHERE "message_sms"."structureId" = '${structureId}'
                 ORDER BY "createdAt" asc
                 LIMIT 1`;

  const res = await appTypeormManager
    .getRepository(MessageSmsTable)
    .query(query);

  if (res.length > 0) {
    return res[0];
  }
  return null;
}
